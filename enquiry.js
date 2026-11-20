/* V44: direct submission via a separately deployed secure endpoint. */
(() => {
  const form = document.getElementById('xcludedEnquiryForm');
  if (!form) return;
  const feedback = document.getElementById('enquiryFeedback');
  const submit = form.querySelector('button[type="submit"]');
  const params = new URLSearchParams(location.search);
  const fields = form.elements;
  const types = {singleCab:'single cab ute',hatchback:'hatchback',sedan:'sedan',dualCab:'dual cab ute',suv:'SUV',large4wd:'large 4WD / wagon',other:'other vehicle'};
  const vehicle = [params.get('year'),params.get('make'),params.get('model')].filter(Boolean).join(' ').slice(0,150);
  if (vehicle) fields.vehicle.value = vehicle;
  const shade=params.get('shade'), removal=params.get('removal'), type=params.get('vehicleType');
  if (type && Object.prototype.hasOwnProperty.call(types,type)) fields.service.value=removal==='Yes'?'Tinting and removal':'Window tinting';
  else if (removal==='Yes') fields.service.value='Tinting and removal';
  const extra=[];
  if(type && Object.prototype.hasOwnProperty.call(types,type))extra.push('Vehicle category: '+types[type]);
  if(['5%','15%','20%','35%'].includes(shade))extra.push('Preferred shade: '+shade);
  if(removal==='Yes')extra.push('Existing tint removal: Yes');
  if(extra.length)fields.message.value=extra.join('\n');
  const value=n=>String(fields[n].value||'').trim();
  form.addEventListener('submit', async e => {
    e.preventDefault();
    feedback.textContent='';
    if (!form.reportValidity()) return;
    if(value('phone').replace(/\D/g,'').length<8){feedback.textContent='Please enter a valid phone number.';fields.phone.focus();return;}
    const endpoint=String(window.XCLUDED_ENQUIRY_ENDPOINT||'').trim();
    if(!/^https:\/\/[^\s]+$/.test(endpoint)){
      feedback.textContent='Online enquiries are not active yet. Please email xcluded.au@gmail.com directly.';
      return;
    }
    const payload={name:value('name'),email:value('email'),phone:value('phone'),vehicle:value('vehicle'),service:value('service'),preferred:value('preferred'),message:value('message'),consent:fields.consent.checked,website:value('website')};
    submit.disabled=true;submit.textContent='SENDING…';feedback.textContent='Submitting your enquiry…';
    try{
      const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      let result={};try{result=await response.json()}catch{}
      if(!response.ok||!result.ok)throw Error('Unable to submit');
      form.reset();
      feedback.textContent='Enquiry received. Thanks for contacting XCLUDED — we’ll be in touch. Your appointment is not confirmed yet.';
    }catch{
      feedback.textContent='Your enquiry could not be confirmed as received. Please try again, or email xcluded.au@gmail.com. Do not assume it was submitted.';
    }finally{submit.disabled=false;submit.textContent='SUBMIT ENQUIRY';}
  });
})();
