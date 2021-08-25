export default function launch() {
  const form = window.document.querySelector('form[name="transfer-students"]');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const studentProfiles = form.querySelector('input[name="ids"]');
    console.log(studentProfiles);
  });
}
