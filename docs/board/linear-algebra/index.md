# 선형대수학 (Linear Algebra)

선형대수학은 데이터를 수치적으로 표현하고 조작하기 위한 수학적 뼈대입니다. 딥러닝에서 가중치 곱셈과 차원 변환 등 대부분의 연산은 선형대수학을 기반으로 이루어집니다.

---

## 1. 벡터와 행렬의 곱셈 (Matrix-Vector Multiplication)

두 행렬 $A \in \mathbb{R}^{m \times n}$와 $B \in \mathbb{R}^{n \times p}$의 곱셈 $C = AB$의 각 원소 $c_{ij}$는 다음과 같이 정의됩니다.

$$
c_{ij} = \sum_{k=1}^{n} a_{ik} b_{kj}
$$

### 파이썬 코드로 표현하기
행렬 곱셈은 NumPy 라이브러리나 PyTorch에서 다음과 같이 쉽게 계산할 수 있습니다.

```python
import numpy as np

# 행렬 정의
A = np.array([[1, 2], [3, 4]])
B = np.array([[5, 6], [7, 8]])

# 행렬 곱 연산 (@ 연산자 사용)
C = A @ B
print(C)
```

---

## 2. 고유값과 고유벡터 (Eigenvalues & Eigenvectors)

정방행렬 $A \in \mathbb{R}^{n \times n}$에 대하여, 영벡터가 아닌 벡터 $\mathbf{v}$와 실수 $\lambda$가 다음 식을 만족할 때, $\mathbf{v}$를 **고유벡터(Eigenvector)**, $\lambda$를 **고유값(Eigenvalue)**이라고 합니다.

$$
A\mathbf{v} = \lambda \mathbf{v}
$$

고유값 분해는 차원 축소 기법인 주성분 분석(PCA) 등 머신러닝/딥러닝의 다양한 차원 변환 알고리즘에서 핵심 역할을 담당합니다.
