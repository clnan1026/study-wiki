# 딥러닝 (Deep Learning)

인공신경망(Artificial Neural Network)은 데이터를 학습하여 복잡한 패턴을 예측하거나 분류하는 강력한 머신러닝 방법론입니다.

---

## 1. 퍼셉트론과 활성화 함수 (Perceptron & Activation)

단일 인공 뉴런은 입력 벡터 $\mathbf{x}$, 가중치 벡터 $\mathbf{w}$, 그리고 편향 $b$를 입력받아 가중합을 구하고, 활성화 함수(Activation Function) $f$를 적용하여 출력 $y$를 냅니다.

$$
y = f\left( \sum_{i=1}^{n} w_i x_i + b \right) = f(\mathbf{w}^T \mathbf{x} + b)
$$

### 시그모이드 활성화 함수 (Sigmoid Function)
실수 값을 $0$과 $1$ 사이의 값으로 매핑하며, 초창기 이진 분류의 출력층에 자주 쓰였습니다.

$$
\sigma(z) = \frac{1}{1 + e^{-z}}
$$

---

## 2. 대표적인 손실 함수 (Loss Functions)

손실 함수는 모델의 예측 결과 $\hat{y}$와 실제 값 $y$의 오차를 측정하여 학습의 방향을 가이드합니다.

### 평균 제곱 오차 (MSE)
회귀 문제에서 정답과의 오차 제곱의 평균을 구합니다.

$$
\mathcal{L}_{\text{MSE}} = \frac{1}{N} \sum_{i=1}^{N} (y_i - \hat{y}_i)^2
$$

### 교차 엔트로피 손실 (Cross-Entropy Loss)
분류 문제에서 정답 확률 분포와 모델 예측 확률 분포 사이의 차이를 구합니다.

$$
\mathcal{L}_{\text{CE}} = -\sum_{i} y_i \log(\hat{y}_i)
$$
