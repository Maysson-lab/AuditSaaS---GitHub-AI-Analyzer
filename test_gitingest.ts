fetch('https://gitingest.com/facebook/react/download').then(res => {
  console.log(res.status, res.headers.get('content-type'));
  return res.text();
}).then(t => console.log(t.slice(0, 300)));
