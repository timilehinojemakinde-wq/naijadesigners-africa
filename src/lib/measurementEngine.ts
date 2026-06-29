import * as poseDetection from "@tensorflow-models/pose-detection";

export type MeasurementResult = {
    height: number;
    bust: number;
    waist: number;
    hips: number;
    shoulder_width: number;
    sleeve_length: number;
    inseam: number;
    neck: number;
    chest: number;
    thigh: number;
    confidence_score: number;
    requires_review: boolean;
    raw_landmarks: object;
};

// MediaPipe BlazePose landmark indices
const LANDMARKS = {
    NOSE: 0,
    LEFT_SHOULDER: 11,
    RIGHT_SHOULDER: 12,
    LEFT_ELBOW: 13,
    RIGHT_ELBOW: 14,
    LEFT_WRIST: 15,
    RIGHT_WRIST: 16,
    LEFT_HIP: 23,
    RIGHT_HIP: 24,
    LEFT_KNEE: 25,
    RIGHT_KNEE: 26,
    LEFT_ANKLE: 27,
    RIGHT_ANKLE: 28,
};

// Pixel distance between two landmarks
function pixelDistance(
    a: poseDetection.Keypoint,
    b: poseDetection.Keypoint
): number {
    return Math.sqrt(
        Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2)
    );
}

// Midpoint between two landmarks
function midpoint(
    a: poseDetection.Keypoint,
    b: poseDetection.Keypoint
): poseDetection.Keypoint {
    return {
        x: (a.x + b.x) / 2,
        y: (a.y + b.y) / 2,
        score: Math.min(a.score ?? 1, b.score ?? 1),
    };
}

// Ellipse circumference approximation (Ramanujan's formula)
function ellipseCircumference(a: number, b: number): number {
    const h = Math.pow(a - b, 2) / Math.pow(a + b, 2);
    return Math.PI * (a + b) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));
}

// Average confidence of key landmarks
function averageConfidence(
    keypoints: poseDetection.Keypoint[],
    indices: number[]
): number {
    const scores = indices
        .map((i) => keypoints[i]?.score ?? 0)
        .filter((s) => s > 0);
    if (scores.length === 0) return 0;
    return scores.reduce((a, b) => a + b, 0) / scores.length;
}

export function extractMeasurements(
    frontKeypoints: poseDetection.Keypoint[],
    sideKeypoints: poseDetection.Keypoint[],
    heightCm: number,
    imageWidth: number,
    imageHeight: number
): MeasurementResult {
    // ── SCALE FACTOR ──────────────────────────────────────
    // Use front photo to calculate pixels per cm
    const nose = frontKeypoints[LANDMARKS.NOSE];
    const leftAnkle = frontKeypoints[LANDMARKS.LEFT_ANKLE];
    const rightAnkle = frontKeypoints[LANDMARKS.RIGHT_ANKLE];
    const ankles = midpoint(leftAnkle, rightAnkle);

    const pixelHeight = Math.abs(ankles.y - nose.y);
    // Add 5% for head above nose
    const scaledPixelHeight = pixelHeight * 1.05;
    const scaleFactor = heightCm / scaledPixelHeight; // cm per pixel

    // ── FRONT LANDMARKS ───────────────────────────────────
    const leftShoulder = frontKeypoints[LANDMARKS.LEFT_SHOULDER];
    const rightShoulder = frontKeypoints[LANDMARKS.RIGHT_SHOULDER];
    const leftHip = frontKeypoints[LANDMARKS.LEFT_HIP];
    const rightHip = frontKeypoints[LANDMARKS.RIGHT_HIP];
    const leftKnee = frontKeypoints[LANDMARKS.LEFT_KNEE];
    const rightKnee = frontKeypoints[LANDMARKS.RIGHT_KNEE];
    const leftElbow = frontKeypoints[LANDMARKS.LEFT_ELBOW];
    const leftWrist = frontKeypoints[LANDMARKS.LEFT_WRIST];

    // ── SIDE LANDMARKS ────────────────────────────────────
    const sideLeftShoulder = sideKeypoints[LANDMARKS.LEFT_SHOULDER];
    const sideRightShoulder = sideKeypoints[LANDMARKS.RIGHT_SHOULDER];
    const sideLeftHip = sideKeypoints[LANDMARKS.LEFT_HIP];
    const sideRightHip = sideKeypoints[LANDMARKS.RIGHT_HIP];

    // ── LINEAR MEASUREMENTS FROM FRONT ───────────────────

    // Shoulder width
    const shoulderWidthPx = pixelDistance(leftShoulder, rightShoulder);
    const shoulder_width = Math.round(shoulderWidthPx * scaleFactor * 10) / 10;

    // Hip width (front)
    const hipWidthFrontPx = pixelDistance(leftHip, rightHip);
    const hipWidthFront = hipWidthFrontPx * scaleFactor;

    // Waist width — estimated as 75% of hip width (narrowest point)
    const waistWidthFront = hipWidthFront * 0.78;

    // Chest width — estimated as 90% of shoulder width
    const chestWidthFront = shoulderWidthPx * scaleFactor * 0.90;

    // Inseam — hip midpoint to ankle midpoint
    const hipMidpoint = midpoint(leftHip, rightHip);
    const ankleMidpoint = midpoint(leftAnkle, rightAnkle);
    const inseamPx = pixelDistance(hipMidpoint, ankleMidpoint);
    const inseam = Math.round(inseamPx * scaleFactor * 10) / 10;

    // Sleeve length — shoulder to elbow to wrist
    const upperArmPx = pixelDistance(leftShoulder, leftElbow);
    const forearmPx = pixelDistance(leftElbow, leftWrist);
    const sleeve_length = Math.round((upperArmPx + forearmPx) * scaleFactor * 10) / 10;

    // ── DEPTH MEASUREMENTS FROM SIDE ─────────────────────
    // Side photo: use horizontal spread of shoulder/hip as depth
    const sideShoulderDepthPx = pixelDistance(sideLeftShoulder, sideRightShoulder);
    const chestDepth = sideShoulderDepthPx * scaleFactor * 0.85;

    const sideHipDepthPx = pixelDistance(sideLeftHip, sideRightHip);
    const hipDepth = sideHipDepthPx * scaleFactor;
    const waistDepth = hipDepth * 0.72;

    // ── CIRCUMFERENCES (ELLIPSE MODEL) ───────────────────

    // Bust/Chest circumference
    const bustA = chestWidthFront / 2;
    const bustB = chestDepth / 2;
    const bust = Math.round(ellipseCircumference(bustA, bustB) * 10) / 10;

    // Chest under bust — slightly smaller
    const chest = Math.round(bust * 0.92 * 10) / 10;

    // Waist circumference
    const waistA = waistWidthFront / 2;
    const waistB = waistDepth / 2;
    const waist = Math.round(ellipseCircumference(waistA, waistB) * 10) / 10;

    // Hip circumference
    const hipA = hipWidthFront / 2;
    const hipB = hipDepth / 2;
    const hips = Math.round(ellipseCircumference(hipA, hipB) * 10) / 10;

    // Neck — estimated from shoulder width
    const neck = Math.round(shoulder_width * 0.38 * 10) / 10;

    // Thigh — estimated from hip circumference
    const thigh = Math.round(hips * 0.33 * 10) / 10;

    // ── CONFIDENCE SCORE ─────────────────────────────────
    const criticalLandmarks = [
        LANDMARKS.LEFT_SHOULDER, LANDMARKS.RIGHT_SHOULDER,
        LANDMARKS.LEFT_HIP, LANDMARKS.RIGHT_HIP,
        LANDMARKS.LEFT_ANKLE, LANDMARKS.RIGHT_ANKLE,
        LANDMARKS.NOSE,
    ];

    const frontConfidence = averageConfidence(frontKeypoints, criticalLandmarks);
    const sideConfidence = averageConfidence(sideKeypoints, criticalLandmarks);
    const confidence_score = Math.round(
        ((frontConfidence + sideConfidence) / 2) * 100
    ) / 100;

    const requires_review = confidence_score < 0.75;

    return {
        height: heightCm,
        bust,
        waist,
        hips,
        shoulder_width,
        sleeve_length,
        inseam,
        neck,
        chest,
        thigh,
        confidence_score,
        requires_review,
        raw_landmarks: {
            front: frontKeypoints,
            side: sideKeypoints,
        },
    };
}