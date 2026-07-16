# 논문 평가 지표 (Evaluation Metrics)

AI 모델 연구 논문에서 자주 사용되는 다양한 평가 지표들의 수학적 정의와 해석 방법을 기록합니다.

---

## 1. 기본 분류 지표 (Classification Metrics)

오차 행렬(Confusion Matrix)의 4개 원소인 **TP(True Positive), FP(False Positive), FN(False Negative), TN(True Negative)**를 기반으로 정밀도와 재현율을 정의합니다.

### 정밀도 (Precision)
모델이 참(Positive)이라고 예측한 것 중에서 실제 참인 비율입니다.

$$
\text{Precision} = \frac{\text{TP}}{\text{TP} + \text{FP}}
$$

### 재현율 (Recall)
실제 참인 데이터 중에서 모델이 참이라고 맞춘 비율입니다.

$$
\text{Recall} = \frac{\text{TP}}{\text{TP} + \text{FN}}
$$

### F1-Score
정밀도와 재현율의 조화 평균(Harmonic Mean)으로, 데이터 라벨이 불균형할 때 모델의 균형 잡힌 성능을 대변합니다.

$$
\text{F1-Score} = 2 \times \frac{\text{Precision} \times \text{Recall}}{\text{Precision} + \text{Recall}}
$$

---

## 2. 기계 번역 지표: BLEU (Bilingual Evaluation Understudy)

자연어 처리(NLP) 번역 태스크에서 기계가 번역한 결과물과 번역 전문가가 작성한 기준 문장(Reference) 간의 유사도를 측정합니다.

단어 번역 성능을 측정하는 $n$-gram 정밀도($p_n$)에 짧은 문장에 페널티를 주는 BP(Brevity Penalty)를 곱해 최종 점수를 계산합니다.

$$
\text{BLEU} = \text{BP} \times \exp \left( \sum_{n=1}^{N} w_n \log p_n \right)
$$
