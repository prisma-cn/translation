if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js');
  });
}

if (document) {
  (function() {
    var bp = document.createElement('script');
    bp.src = 'https://zz.bdstatic.com/linksubmit/push.js';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(bp, s);
  })();
  (function() {
    var hm = document.createElement('script');
    hm.src = 'https://hm.baidu.com/hm.js?2e9ae47cbe08221547275dfcf7235625';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(hm, s);
  })();
}
