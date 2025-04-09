$(function () {
  $('#checkoutForm').on('submit', function (e) {
    e.preventDefault();

    // Hide all error messages
    $('.error').hide();

    // Remove invalid class from all inputs
    $('input').removeClass('invalid');

    let isValid = true;

    // Full Name
    const fullName = $('#fullName');
    if (!/^[A-Za-z ]+$/.test(fullName.val())) {
      $('#nameError').show();
      fullName.addClass('invalid');
      isValid = false;
    }

    // Email
    const email = $('#email');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.val())) {
      $('#emailError').show();
      email.addClass('invalid');
      isValid = false;
    }

    // Phone
    const phone = $('#phone');
    if (!/^\d{10,15}$/.test(phone.val())) {
      $('#phoneError').show();
      phone.addClass('invalid');
      isValid = false;
    }

    // Address
    const address = $('#address');
    if ($.trim(address.val()) === '') {
      $('#addressError').show();
      address.addClass('invalid');
      isValid = false;
    }

    // Card Number
    const cardNumber = $('#cardNumber');
    if (!/^\d{16}$/.test(cardNumber.val())) {
      $('#cardError').show();
      cardNumber.addClass('invalid');
      isValid = false;
    }

    // Expiry Date
    const expiry = $('#expiry');
    if (expiry.val()) {
      const [year, month] = expiry.val().split('-');
      const expiryDate = new Date(year, month - 1);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (expiryDate <= today) {
        $('#expiryError').show();
        expiry.addClass('invalid');
        isValid = false;
      }
    } else {
      $('#expiryError').show();
      expiry.addClass('invalid');
      isValid = false;
    }

    // CVV
    const cvv = $('#cvv');
    if (!/^\d{3}$/.test(cvv.val())) {
      $('#cvvError').show();
      cvv.addClass('invalid');
      isValid = false;
    }

    if (isValid) {
      this.reset();
      // Optional: show success message
    }
  });

  // Real-time validation
  $('input').on('input', function () {
    if (this.checkValidity()) {
      $(this).removeClass('invalid');
      $('#' + this.id + 'Error').hide();
    }
  });
});
