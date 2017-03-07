$(function() {
  $(document).on('focus', '.form-control', function() {
    var $this = $(this);
    $this.closest('.form-group').addClass('focus');
  });

  $(document).on('blur', '.form-control', function() {
    var $this = $(this);
    $this.closest('.form-group').removeClass('focus');
  });

  $('.global-message').removeClass('hide');
});