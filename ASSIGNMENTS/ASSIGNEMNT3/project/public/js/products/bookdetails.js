const reviews = document.querySelectorAll('#reviewContainer .review');
  const btn = document.getElementById('loadMoreBtn');
  let visibleCount = 3;

  // Initially show only first 3
  reviews.forEach((review, index) => {
    review.classList.toggle('d-none', index >= visibleCount);
  });

  btn.addEventListener('click', () => {
    const nextCount = visibleCount + 3;
    reviews.forEach((review, index) => {
      if (index < nextCount) {
        review.classList.remove('d-none');
      }
    });
    visibleCount = nextCount;

    if (visibleCount >= reviews.length) {
      btn.style.display = 'none';
    }
  });
