export function LevelBadge({
  cor,
  nome,
  size = 36,
  imagem,
}: {
  cor: string;
  nome?: string;
  size?: number;
  imagem?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      {imagem ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imagem}
          alt={nome ?? 'Bola'}
          className="rounded-full object-cover ring-2 ring-white shadow"
          style={{ width: size, height: size }}
        />
      ) : (
        <span
          className="rounded-full ring-2 ring-white shadow"
          style={{ background: cor, width: size, height: size, display: 'inline-block' }}
        />
      )}
      {nome && <span className="text-sm font-medium text-ink-700">{nome}</span>}
    </div>
  );
}
