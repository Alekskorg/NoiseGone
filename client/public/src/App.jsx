import React, { useState } from 'react';

export default function App() {
  const [file,         setFile]         = useState(null);
  const [processing,   setProcessing]   = useState(false);
  const [resultUrl,    setResultUrl]    = useState('');
  const [minutesLeft,  setMinutesLeft]  = useState(5);   // лимит демо

  /* загрузка файла */
  const upload = e => {
    const f = e.target.files[0];
    if (f) { setFile(f); setResultUrl(''); }
  };

  /* очистка */
  const clean = async () => {
    if (!file)               return alert('Выберите файл!');
    if (minutesLeft <= 0)    return alert('Лимит исчерпан — купите минуты.');

    setProcessing(true);
    const form = new FormData();  form.append('audio', file);

    const res  = await fetch('/api/clean', { method:'POST', body: form });
    const json = await res.json();

    setProcessing(false);
    setResultUrl(json.url);
    setMinutesLeft(m => m - 1);
  };

  /* оплата через Stripe */
  const buyMinutes = async () => {
    const res  = await fetch('/api/create-checkout-session', {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ quantity: 10 })     // 10 минут
    });
    const json = await res.json();
    window.location.href = json.url;             // переходим на Stripe
  };

  return (
    <div style={{ padding:24,maxWidth:480,margin:'0 auto',textAlign:'center' }}>
      <img src='/logo.png' alt='NoiseGone' style={{ width:160,marginBottom:12 }}/>
      <h1>NoiseGone</h1>

      <p>Бесплатно осталось минут: <b>{minutesLeft}</b></p>

      <input type='file' accept='audio/*' onChange={upload} />
      <br/><br/>

      <button disabled={!file||processing} onClick={clean}>
        {processing ? '⏳ Обработка…' : 'Очистить аудио'}
      </button>

      {resultUrl && (
        <>
          <h3 style={{marginTop:32}}>Результат:</h3>
          <audio controls src={resultUrl} style={{ width:'100%' }}/>
          <br/>
          <a href={resultUrl} download='cleaned-audio.mp3'>⬇ Скачать</a>
        </>
      )}

      <hr style={{ margin:'40px 0' }}/>

      <button onClick={buyMinutes}>Купить минуты (€0,10/мин)</button>
    </div>
  );
}
