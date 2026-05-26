const BASE_URL = 'http://localhost:8081';

export default function Avatar({ profileImg, nickname, className = '', style = {} }) {
  const url = profileImg
    ? (profileImg.startsWith('http') ? profileImg : `${BASE_URL}${profileImg}`)
    : null;

  if (url) {
    return (
      <img
        src={url}
        alt={nickname ?? ''}
        className={`avatar-img ${className}`}
        style={style}
      />
    );
  }
  return (
    <div className={`avatar-letter ${className}`} style={style}>
      {nickname?.[0] ?? '?'}
    </div>
  );
}
