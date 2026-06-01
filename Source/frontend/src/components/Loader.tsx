export default function Loader({ text = 'Загрузка…' }: { text?: string }) {
  return (
    <div className="loader">
      <div className="row">
        <span className="spinner" />
        <span>{text}</span>
      </div>
    </div>
  );
}
