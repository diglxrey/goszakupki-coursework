import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="container center" style={{ paddingTop: 80 }}>
      <div style={{ fontSize: 72, fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-line)' }}>
        404
      </div>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>Страница не найдена</h1>
      <p className="text-soft mb-24">Запрашиваемая страница не существует</p>
      <Link to="/tenders" className="btn btn-primary">На главную</Link>
    </div>
  );
}
