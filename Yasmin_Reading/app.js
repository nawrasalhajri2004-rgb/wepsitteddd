let auth, db, currentUser=null, currentStudent=null, activeStory=null, teacherStudents={};
function hideAll(){['home','student-login','teacher-login','student-area','reader','teacher-area'].forEach(id=>document.getElementById(id).classList.add('hidden'))}
function show(id){hideAll();document.getElementById(id).classList.remove('hidden');window.scrollTo({top:0,behavior:'smooth'})}
function goHome(){show('home')}
function showStudentLogin(){show('student-login')}
function showTeacherLogin(){show('teacher-login')}
function firebaseReady(){return window.firebase && firebaseConfig.apiKey!=="PASTE_API_KEY"}
function initFirebase(){if(!firebaseReady())return false;if(!firebase.apps.length)firebase.initializeApp(firebaseConfig);auth=firebase.auth();db=firebase.database();return true}
function enterStudent(){
 const name=document.getElementById('studentName').value.trim(), cls=document.getElementById('studentClass').value.trim();
 const err=document.getElementById('studentError');err.textContent='';
 if(!name||!cls){err.textContent='يرجى كتابة اسم الطالب والصف.';return}
 if(!initFirebase()){err.textContent='يجب إعداد Firebase أولًا. راجع ملف README في مجلد الموقع.';return}
 auth.signInAnonymously().then(cred=>{
   currentUser=cred.user;currentStudent={name,cls};
   return db.ref('students/'+currentUser.uid).once('value').then(snap=>{
     const old=snap.val()||{};return db.ref('students/'+currentUser.uid).update({name,studentClass:cls,createdAt:old.createdAt||Date.now(),lastActive:Date.now()}).then(()=>{showStudentArea(old.progress||{});});
   });
 }).catch(e=>err.textContent='تعذر الدخول: '+friendlyError(e));
}
function showStudentArea(progress={}){
 document.getElementById('studentWelcome').textContent=currentStudent.name;
 document.getElementById('studentClassLabel').textContent='الصف: '+currentStudent.cls;
 renderStories(progress);updateStudentStats(progress);show('student-area');
}
function renderStories(progress={}){
 const grid=document.getElementById('storyGrid');grid.innerHTML='';
 STORIES.forEach(st=>{
  const p=progress[st.id], done=!!p;
  const card=document.createElement('div');card.className='story-card'+(done?' done':'');
  card.innerHTML=`<span class="num">القصة ${st.id} ${done?'· ✓ مكتملة':''}</span><h3>${escapeHtml(st.title)}</h3><p>قصة قصيرة · ٥ أسئلة</p><button onclick="openStory(${st.id})">${done?'إعادة القراءة':'اقرأ القصة الآن'}</button>`;
  grid.appendChild(card);
 });
}
function updateStudentStats(progress){const vals=Object.values(progress||{});document.getElementById('doneCount').textContent=vals.length;document.getElementById('scoreAvg').textContent=vals.length?Math.round(vals.reduce((a,b)=>a+(b.score||0),0)/vals.length)+'%':'0%'}
function openStory(id){
 activeStory=STORIES.find(s=>s.id===id);if(!activeStory)return;
 document.getElementById('storyNumber').textContent='القصة رقم '+id+' من 30';
 document.getElementById('storyTitle').textContent=activeStory.title;
 document.getElementById('storyText').textContent=activeStory.body;
 const q=document.getElementById('quiz');q.innerHTML='';
 activeStory.questions.forEach((item,i)=>{
  const box=document.createElement('div');box.className='quiz-question';
  const h=document.createElement('h3');h.textContent=(i+1)+'. '+item.q;box.appendChild(h);
  item.options.forEach((op,j)=>{
   const lab=document.createElement('label');lab.className='option';
   lab.innerHTML=`<input type="radio" name="q${i}" value="${j}"><span>${escapeHtml(op)}</span>`;box.appendChild(lab);
  });q.appendChild(box);
 });
 document.getElementById('quizResult').innerHTML='';document.getElementById('submitQuiz').disabled=false;show('reader');
}
function submitQuiz(){
 if(!activeStory||!currentUser)return;
 let score=0,answers=[];
 for(let i=0;i<5;i++){const selected=document.querySelector(`input[name="q${i}"]:checked`);if(!selected){document.getElementById('quizResult').innerHTML='<p class="error">أجب عن الأسئلة الخمسة قبل الإرسال.</p>';return;}const val=Number(selected.value);answers.push(val);if(val===activeStory.questions[i].a)score++;}
 const result={score:score*20,correct:score,total:5,answers,completedAt:Date.now(),storyTitle:activeStory.title};
 db.ref('students/'+currentUser.uid+'/progress/'+activeStory.id).set(result).then(()=>{
  return db.ref('students/'+currentUser.uid+'/lastActive').set(Date.now());
 }).then(()=>{
  document.getElementById('quizResult').innerHTML=`<div class="result"><strong>أحسنت يا بطل! 🌟</strong><p>حصلت على ${score} من 5 · النتيجة ${score*20}%</p>${score===5?'ممتاز! كل إجاباتك صحيحة.':'استمر في المحاولة، أنت تتعلم كل يوم!'}</div>`;
  document.getElementById('submitQuiz').disabled=true;
 }).catch(e=>document.getElementById('quizResult').innerHTML='<p class="error">لم يتم حفظ النتيجة. تحقق من الاتصال.</p>');
}
function backToStories(){if(!currentUser)return;db.ref('students/'+currentUser.uid+'/progress').once('value').then(s=>{showStudentArea(s.val()||{});});}
function logoutStudent(){if(auth&&currentUser){auth.signOut().finally(()=>{currentUser=null;currentStudent=null;goHome();});}else goHome();}
function teacherLogin(){
 const email=document.getElementById('teacherEmail').value.trim(),pass=document.getElementById('teacherPassword').value;
 const err=document.getElementById('teacherError');err.textContent='';
 if(!email||!pass){err.textContent='أدخل البريد الإلكتروني وكلمة المرور.';return}
 if(!initFirebase()){err.textContent='يجب إعداد Firebase أولًا. راجع ملف README.';return}
 auth.signInWithEmailAndPassword(email,pass).then(cred=>{
  currentUser=cred.user;return loadTeacherData();
 }).then(()=>show('teacher-area')).catch(e=>err.textContent='تعذر تسجيل الدخول: '+friendlyError(e));
}
function loadTeacherData(){
 if(!currentUser)return Promise.reject(new Error('No user'));
 return db.ref('students').once('value').then(snap=>{teacherStudents=snap.val()||{};renderTeacherTable();});
}
function renderTeacherTable(){
 const term=(document.getElementById('searchStudent').value||'').trim().toLowerCase(),rows=document.getElementById('teacherRows');
 const all=Object.entries(teacherStudents).map(([uid,s])=>({uid,...s})).filter(s=>(s.name||'').toLowerCase().includes(term)||(s.studentClass||'').toLowerCase().includes(term));
 let attempts=0,scoreSum=0,scoreCount=0;
 Object.values(teacherStudents).forEach(s=>Object.values(s.progress||{}).forEach(p=>{attempts++;scoreSum+=p.score||0;scoreCount++;}));
 document.getElementById('totalStudents').textContent=Object.keys(teacherStudents).length;
 document.getElementById('totalAttempts').textContent=attempts;
 document.getElementById('teacherAverage').textContent=scoreCount?Math.round(scoreSum/scoreCount)+'%':'0%';
 if(!all.length){rows.innerHTML='<tr><td colspan="6">لا توجد نتائج مطابقة.</td></tr>';return}
 rows.innerHTML=all.map(s=>{
  const ps=Object.values(s.progress||{}),avg=ps.length?Math.round(ps.reduce((a,p)=>a+(p.score||0),0)/ps.length):0;
  return `<tr><td>${escapeHtml(s.name||'')}</td><td>${escapeHtml(s.studentClass||'')}</td><td>${ps.length}/30</td><td>${avg}%</td><td>${s.lastActive?new Date(s.lastActive).toLocaleString('ar-OM'):'—'}</td><td><button onclick="showStudentDetails('${s.uid}')">عرض التقدم</button></td></tr>`;
 }).join('');
}
function showStudentDetails(uid){
 const s=teacherStudents[uid];if(!s)return;const box=document.getElementById('studentDetails');const ps=s.progress||{};
 let html=`<h3>تقدم الطالب: ${escapeHtml(s.name||'')}</h3><p>الصف: ${escapeHtml(s.studentClass||'')}</p><div class="table-wrap"><table><thead><tr><th>القصة</th><th>الدرجة</th><th>تاريخ الإكمال</th></tr></thead><tbody>`;
 STORIES.forEach(st=>{const p=ps[st.id];html+=`<tr><td>${escapeHtml(st.title)}</td><td>${p?(p.correct+'/5 ('+p.score+'%)'):'لم تُكمل'}</td><td>${p?new Date(p.completedAt).toLocaleString('ar-OM'):'—'}</td></tr>`;});
 html+='</tbody></table></div>';box.innerHTML=html;box.classList.remove('hidden');box.scrollIntoView({behavior:'smooth'});
}
function teacherLogout(){if(auth)auth.signOut().finally(()=>{currentUser=null;teacherStudents={};goHome();});else goHome();}
function friendlyError(e){return e.code==='auth/invalid-credential'?'البريد أو كلمة المرور غير صحيحة.':e.message}
function escapeHtml(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
