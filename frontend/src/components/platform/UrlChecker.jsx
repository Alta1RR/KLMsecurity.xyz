import { useState } from 'react'
import './shared.css'
import { checkUrl } from '../../api/security'

function Skeleton() {
  return (
    <div className="skeleton-lines">
      <div className="skel-line w-90" />
      <div className="skel-line w-60" />
      <div className="skel-line w-75" />
      <div className="skel-line w-45" />
    </div>
  )
}

export default function UrlChecker() {
  const [url,     setUrl]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [report,  setReport]  = useState(null)

  const submit = async e => {
    e.preventDefault()
    const v = url.trim()
    if (!v) { setError('Введите URL.'); setReport(null); return }
    if (!v.startsWith('http://') && !v.startsWith('https://')) {
      setError('URL должен начинаться с http:// или https://'); setReport(null); return
    }
    setError(''); setLoading(true); setReport(null)
    try {
      const data = await checkUrl(v)
      setReport(data)
    } catch {
      setError('Нет связи с сервером. Убедитесь, что backend запущен на порту 8081.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="tool-panel">
      <div className="tool-header">
        <div className="tool-eyebrow">Web2 Security · VirusTotal</div>
        <h2 className="tool-title">Проверка ссылки</h2>
        <p className="tool-subtitle">
          Анализ URL на фишинг и вредоносное ПО через VirusTotal.
          Показывает количество срабатываний антивирусных движков.
        </p>
      </div>

      <form className="tool-input-row" onSubmit={submit}>
        <input
          className="tool-input"
          type="text"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://example.com/suspicious-page"
          autoComplete="off"
        />
        <button className="tool-submit" type="submit" disabled={loading}>
          {loading ? 'Анализ...' : 'Проверить'}
        </button>
      </form>

      {error && <div className="tool-error">{error}</div>}

      <ul className="tool-hints">
        <li>Поддерживаются любые HTTP/HTTPS ссылки.</li>
        <li>Данные предоставлены VirusTotal через backend.</li>
      </ul>

      <div className="report-card">
        {!loading && !report && (
          <div className="report-empty">
            <h2>Ожидаем ссылку</h2>
            <p>После анализа здесь появится вердикт VirusTotal и статистика срабатываний.</p>
          </div>
        )}

        {loading && <Skeleton />}

        {report && (
          <div>
            {report.error ? (
              <div className="tool-error" style={{ margin: 0 }}>{report.raw}</div>
            ) : (
              <>
                <div className={`verdict-banner${report.safe ? ' verdict-safe' : ' verdict-danger'}`}>
                  {report.safe
                    ? '🟢 БЕЗОПАСНО — антивирусы угроз не нашли'
                    : '⛔ ОПАСНО — обнаружена угроза, не переходите по ссылке'}
                </div>

                <div className="report-head">
                  <div className="score-badge-big" style={report.dangerous
                    ? { background: 'var(--danger)' }
                    : { background: 'linear-gradient(135deg,#059669,#10b981)' }
                  }>
                    {report.safe ? '✓' : '✗'}
                  </div>
                  <div>
                    <div className="report-label">VirusTotal</div>
                    <div className="report-risk">{report.safe ? 'Угроз нет' : 'Угроза обнаружена'}</div>
                    <div className="report-addr">{report.url}</div>
                  </div>
                </div>

                {report.dangerous && (
                  <div className="report-grid">
                    <div className="report-item">
                      <span>Вредоносных</span>
                      <strong style={{ color: 'var(--danger)' }}>{report.malicious}</strong>
                    </div>
                    <div className="report-item">
                      <span>Подозрительных</span>
                      <strong style={{ color: '#fb923c' }}>{report.suspicious}</strong>
                    </div>
                    <div className="report-item">
                      <span>Рекомендация</span>
                      <strong style={{ color: 'var(--danger)' }}>Не открывать</strong>
                    </div>
                  </div>
                )}

                {report.safe && (
                  <div className="findings">
                    <h3>Результат</h3>
                    <ul>
                      <li>
                        <span className="severity severity-low">Низкий</span>
                        Ни один антивирусный движок не зафиксировал угроз
                      </li>
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
