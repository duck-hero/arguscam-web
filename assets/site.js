/* ArgusCam – mã chiến dịch App Store (ct) và trang /tai.
   Link App Store trong HTML đã có ct mặc định của trang (web-home, web-blog…), nên không có JS vẫn đo được.
   Nếu URL có ?ct= hợp lệ (a-z, 0-9, dấu gạch ngang, tối đa 30 ký tự) thì dùng nó cho mọi link App Store trên trang
   và giữ trong phiên (sessionStorage), để người đến từ /tt rồi xem tiếp trang khác vẫn tính là tt.
   Thứ tự: ct trên URL > ct trong phiên > ct mặc định của trang. Không gửi dữ liệu cá nhân, không pixel, không SDK. */
(function () {
  var HOP_LE = /^[a-z0-9-]{1,30}$/;
  var KHOA = 'arguscam-ct';
  var ct = null;
  try { ct = new URLSearchParams(location.search).get('ct'); } catch (e) { ct = null; }
  if (ct && HOP_LE.test(ct)) {
    try { sessionStorage.setItem(KHOA, ct); } catch (e) {}
  } else {
    ct = null;
    try { ct = sessionStorage.getItem(KHOA); } catch (e) { ct = null; }
    if (!ct || !HOP_LE.test(ct)) ct = null;
  }
  if (ct) {
    Array.prototype.forEach.call(document.querySelectorAll('a[href*="apps.apple.com"]'), function (a) {
      try {
        var u = new URL(a.href);
        if (u.hostname !== 'apps.apple.com' || !u.searchParams.get('pt')) return;
        u.searchParams.set('ct', ct);
        a.href = u.toString();
      } catch (e) {}
    });
  }

  /* Trang /tai: iPhone, iPad (kể cả iPadOS báo MacIntel) mở thẳng App Store, nút vẫn ở đó nếu chưa mở được
     (trừ bot thu thập dữ liệu: chúng thấy trang, không bị chuyển đi); Android đưa ô "sắp có trên Google Play" lên trước;
     máy tính giữ mã QR, đổi sang mã QR mang đúng ct (tt, yt…) để mở trên điện thoại vẫn tính đúng kênh. */
  var nut = document.getElementById('tai-appstore');
  if (!nut) return;
  var ua = navigator.userAgent || '';
  var ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var bot = /bot|crawl|spider|slurp|Applebot|bingbot|Googlebot|facebookexternalhit|Bytespider|Zalo.*(bot|crawler)/i.test(ua);
  var android = !ios && /Android/i.test(ua);
  document.documentElement.classList.add(ios ? 'tb-ios' : android ? 'tb-android' : 'tb-khac');
  if (ct) {
    var hit = document.querySelector('.tai-qr-bien[data-ct="' + ct + '"]');
    if (hit) Array.prototype.forEach.call(document.querySelectorAll('.tai-qr-bien'), function (d) { d.hidden = d !== hit; });
  }
  if (ios && !bot) {
    var bao = document.getElementById('tai-dang-mo');
    if (bao) bao.hidden = false;
    try { location.replace(nut.href); } catch (e) {}
  }
})();

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
