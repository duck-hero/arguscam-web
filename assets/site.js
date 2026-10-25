/* ArgusCam – gửi form liên hệ qua Web3Forms, đóng menu di động khi chọn mục */
document.querySelectorAll('form[data-web3forms]').forEach(function (form) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var trangThai = form.querySelector('.ghichu');
    var hoten = form.querySelector('[name="Họ và tên"]').value.trim();
    var sdt = form.querySelector('[name="Số điện thoại"]').value.trim();
    var datTrangThai = function (lop, chu) { trangThai.className = 'ghichu ' + lop; trangThai.textContent = chu; };
    if (!hoten || !sdt) {
      datTrangThai('loi', 'Vui lòng nhập họ tên và số điện thoại để chúng tôi liên hệ lại.');
      return;
    }
    var nut = form.querySelector('button[type="submit"]');
    var chuNut = nut.textContent;
    nut.disabled = true;
    nut.textContent = 'Đang gửi...';
    datTrangThai('', 'Đang gửi thông tin...');
    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(Object.fromEntries(new FormData(form)))
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (!data.success) throw new Error(data.message || 'fail');
        form.reset();
        datTrangThai('ok', 'Cảm ơn ' + hoten + '! ArgusCam đã nhận thông tin và sẽ liên hệ qua số ' + sdt + ' trong giờ làm việc.');
      })
      .catch(function () {
        datTrangThai('loi', 'Gửi không thành công. Vui lòng thử lại hoặc nhắn Zalo 0588855508.');
      })
      .finally(function () {
        nut.disabled = false;
        nut.textContent = chuNut;
      });
  });
});

document.querySelectorAll('.menu-ds a').forEach(function (a) {
  a.addEventListener('click', function () { a.closest('details').removeAttribute('open'); });
});
