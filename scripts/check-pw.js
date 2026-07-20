const bcrypt = require('/mnt/c/NIRUT-Storage/PROJECT-AI/Neno-Jewelry/jewelry-store/node_modules/bcryptjs');
const hash = '$2a$12$dntjS5TKWhrKDjcMFWsb.OLx2r6m/zqdPWbGWn2cpjk.VbXJ/RYA2';
const passwords = ['Neno2024!', 'Dev@123$Test#2026', 'admin1234', 'password123', 'Dev@123$Test#2026'];
passwords.forEach(p => {
  const match = bcrypt.compareSync(p, hash);
  console.log(p + ': ' + match);
});
