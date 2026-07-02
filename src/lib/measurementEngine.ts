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

// Local type — replaces @tensorflow-models/pose-detection's Keypoint type
type Keypoint = {
    x: number;
    y: number;
    z?: number;
    score?: number;
    name?: string;
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
function pixelDistance(a: Keypoint, b: Keypoint): number {
    return Math.sqrt(
        Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2)
    );
}

// Midpoint between two landmarks
function midpoint(a: Keypoint, b: Keypoint): Keypoint {
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
function averageConfidence(keypoints: Keypoint[], indices: number[]): number {
    const scores = indices
        .map((i) => keypoints[i]?.score ?? 0)
        .filter((s) => s > 0);
    if (scores.length === 0) return 0;
    return scores.reduce((a, b) => a + b, 0) / scores.length;
}

export function extractMeasurements(
    frontKeypoints: Keypoint[],
    sideKeypoints: Keypoint[],
    heightCm: number,
    imageWidth: number,
    imageHeight: number
): MeasurementResult {
    // ── SCALE FACTOR ──────────────────────────────────────
    const nose = frontKeypoints[LANDMARKS.NOSE];
    const leftAnkle = frontKeypoints[LANDMARKS.LEFT_ANKLE];
    const rightAnkle = frontKeypoints[LANDMARKS.RIGHT_ANKLE];
    const ankles = midpoint(leftAnkle, rightAnkle);

    const pixelHeight = Math.abs(ankles.y - nose.y);
    const scaledPixelHeight = pixelHeight * 1.05;
    const scaleFactor = heightCm / scaledPixelHeight;

    // ── FRONT LANDMARKS ───────────────────────────────────
    const leftShoulder = frontKeypoints[LANDMARKS.LEFT_SHOULDER];
    const rightShoulder = frontKeypoints[LANDMARKS.RIGHT_SHOULDER];
    const leftHip = frontKeypoints[LANDMARKS.LEFT_HIP];
    const rightHip = frontKeypoints[LANDMARKS.RIGHT_HIP];
    const leftElbow = frontKeypoints[LANDMARKS.LEFT_ELBOW];
    const leftWrist = frontKeypoints[LANDMARKS.LEFT_WRIST];

    // ── SIDE LANDMARKS ────────────────────────────────────
    const sideLeftShoulder = sideKeypoints[LANDMARKS.LEFT_SHOULDER];
    const sideRightShoulder = sideKeypoints[LANDMARKS.RIGHT_SHOULDER];
    const sideLeftHip = sideKeypoints[LANDMARKS.LEFT_HIP];
    const sideRightHip = sideKeypoints[LANDMARKS.RIGHT_HIP];

    // ── LINEAR MEASUREMENTS FROM FRONT ───────────────────
    const shoulderWidthPx = pixelDistance(leftShoulder, rightShoulder);
    const shoulder_width = Math.round(shoulderWidthPx * scaleFactor * 10) / 10;

    const hipWidthFrontPx = pixelDistance(leftHip, rightHip);
    const hipWidthFront = hipWidthFrontPx * scaleFactor;

    const waistWidthFront = hipWidthFront * 0.78;
    const chestWidthFront = shoulderWidthPx * scaleFactor * 0.90;

    const hipMidpoint = midpoint(leftHip, rightHip);
    const ankleMidpoint = midpoint(leftAnkle, rightAnkle);
    const inseamPx = pixelDistance(hipMidpoint, ankleMidpoint);
    const inseam = Math.round(inseamPx * scaleFactor * 10) / 10;

    const upperArmPx = pixelDistance(leftShoulder, leftElbow);
    const forearmPx = pixelDistance(leftElbow, leftWrist);
    const sleeve_length = Math.round((upperArmPx + forearmPx) * scaleFactor * 10) / 10;

    // ── DEPTH MEASUREMENTS FROM SIDE ─────────────────────
    const sideShoulderDepthPx = pixelDistance(sideLeftShoulder, sideRightShoulder);
    const chestDepth = sideShoulderDepthPx * scaleFactor * 0.85;

    const sideHipDepthPx = pixelDistance(sideLeftHip, sideRightHip);
    const hipDepth = sideHipDepthPx * scaleFactor;
    const waistDepth = hipDepth * 0.72;

    // ── CIRCUMFERENCES (ELLIPSE MODEL) ───────────────────
    const bustA = chestWidthFront / 2;
    const bustB = chestDepth / 2;
    const bust = Math.round(ellipseCircumference(bustA, bustB) * 10) / 10;

    const chest = Math.round(bust * 0.92 * 10) / 10;

    const waistA = waistWidthFront / 2;
    const waistB = waistDepth / 2;
    const waist = Math.round(ellipseCircumference(waistA, waistB) * 10) / 10;

    const hipA = hipWidthFront / 2;
    const hipB = hipDepth / 2;
    const hips = Math.round(ellipseCircumference(hipA, hipB) * 10) / 10;

    const neck = Math.round(shoulder_width * 0.38 * 10) / 10;
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