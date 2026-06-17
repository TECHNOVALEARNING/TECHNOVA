fetch('https://technovalearning.com/outils-digitaux').then(r => r.text()).then(t => { 
  const match = t.match(/<script type="module" crossorigin src="(.*?)">/); 
  if(match) { 
    console.log('Script URL:', match[1]); 
    fetch('https://technovalearning.com' + match[1]).then(r => r.text()).then(js => {
      console.log('JS Contains Création:', js.includes('Création'));
      console.log('JS Contains Cr?ation:', js.includes('Cr?ation'));
      console.log('JS Contains Artifiielle:', js.includes('Artifiielle'));
    }); 
  } else { 
    console.log('No script tag found'); 
  } 
});
