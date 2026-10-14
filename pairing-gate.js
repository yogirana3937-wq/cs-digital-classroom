/* Fail-closed pairing state controller. Not connected to Teacher/Board yet. */
(function(root){
'use strict';
const STATES=Object.freeze({PENDING:'pending',VERIFIED:'verified',APPROVED:'approved',ACTIVE:'active',CLOSED:'closed'});
function controller(){
 let state=STATES.PENDING,verified=false,approved=false,closed=false;
 function requireOpen(){if(closed)throw new Error('Pairing closed')}
 function activate(){if(verified&&approved&&!closed)state=STATES.ACTIVE}
 return Object.freeze({
  status:()=>state,
  isAuthenticated:()=>state===STATES.ACTIVE,
  markVerified(result){requireOpen();if(state===STATES.ACTIVE)throw new Error('Already active');if(result!==true){closed=true;state=STATES.CLOSED;return false}verified=true;state=STATES.VERIFIED;activate();return true},
  teacherDecision(allow){requireOpen();if(state===STATES.ACTIVE)throw new Error('Already active');if(allow!==true){closed=true;state=STATES.CLOSED;return false}approved=true;state=STATES.APPROVED;activate();return true},
  close(){closed=true;verified=false;approved=false;state=STATES.CLOSED},
  allowLessonData(){return state===STATES.ACTIVE}
 });
}
const exported=Object.freeze({controller,STATES});if(typeof module!=='undefined'&&module.exports)module.exports=exported;else root.ClassroomPairingGate=exported;
})(globalThis);
