/* ArgusCam – gửi form liên hệ qua Web3Forms; menu di động đóng khi chọn mục, chạm ra ngoài hoặc bấm Esc */
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

/* Menu di động (<details class="menu">): đóng khi chọn mục, chạm ra ngoài hoặc bấm Esc; cập nhật nhãn cho trình đọc màn hình */
(function () {
  var menus = Array.prototype.slice.call(document.querySelectorAll('details.menu'));
  if (!menus.length) return;
  var dong = function (m) { if (m.open) m.removeAttribute('open'); };
  menus.forEach(function (m) {
    var nut = m.querySelector('summary');
    var capNhat = function () {
      if (!nut) return;
      nut.setAttribute('aria-expanded', m.open ? 'true' : 'false');
      nut.setAttribute('aria-label', m.open ? 'Đóng menu' : 'Mở menu');
    };
    m.addEventListener('toggle', capNhat);
    capNhat();
    m.querySelectorAll('.menu-ds a').forEach(function (a) {
      a.addEventListener('click', function () { dong(m); });
    });
  });
  /* pointerdown: iOS Safari không đẩy sự kiện click từ vùng không bấm được lên document.
     Cú chạm chỉ để đóng menu thì nuốt luôn click theo sau, để không mở nhầm liên kết bên dưới. */
  var nuot = false;
  document.addEventListener('pointerdown', function (e) {
    nuot = false;
    menus.forEach(function (m) { if (m.open && !m.contains(e.target)) { dong(m); nuot = true; } });
  });
  document.addEventListener('click', function (e) {
    if (nuot) { nuot = false; e.preventDefault(); e.stopPropagation(); return; }
    menus.forEach(function (m) { if (m.open && !m.contains(e.target)) dong(m); });
  }, true);
  document.addEventListener('keydown', function (e) {
    nuot = false; /* phím Enter trên liên kết không bao giờ bị nuốt */
    if (e.key !== 'Escape' && e.key !== 'Esc') return;
    menus.forEach(function (m) {
      if (!m.open) return;
      var trongMenu = m.contains(document.activeElement);
      dong(m);
      if (trongMenu) m.querySelector('summary').focus();
    });
  });
})();
