import { Link } from 'react-router-dom';
import './TasbihCounter.css';

export default function TasbihCounter() {
  return (
    <>
      <h2>Daily <span className="text-gold">Tasbih</span> Counter</h2>
      <p className="features-subheading">
        Click to count your dhikr — SubhanAllah, Alhamdulillah, Allahu Akbar.
      </p>

      <div className="tasbih-preview card">
        <div className="tasbih-preview-body">
          <span className="tasbih-bead">📿</span>
          <span className="tasbih-preview-text">Start your daily dhikr</span>
        </div>
        <Link to="/tasbih" className="btn btn-primary tasbih-open-btn">
          Open Tasbih →
        </Link>
      </div>
    </>
  );
}
