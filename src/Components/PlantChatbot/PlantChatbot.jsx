import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../LanguageContext/LanguageContext';
import { PLANT_CHAT_FAQ } from '../../data/plantChatFaq';
import styles from './PlantChatbot.module.css';

export default function PlantChatbot() {
  const { t, isAr } = useLanguage();
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState(null);

  const active = useMemo(
    () => PLANT_CHAT_FAQ.find((item) => item.id === activeId) || null,
    [activeId]
  );

  const label = (item) => (isAr ? item.q.ar : item.q.en);
  const answer = (item) => (isAr ? item.a.ar : item.a.en);

  return (
    <>
      <button
        type="button"
        className={styles.fab}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="plant-chat-panel"
      >
        <i
          className={`fa-solid ${open ? 'fa-xmark' : 'fa-seedling'} ${styles.fabIcon}`}
          aria-hidden
        />
        <span>{open ? t('chatClose') : t('chatOpen')}</span>
      </button>

      {open && (
        <div
          id="plant-chat-panel"
          className={styles.panel}
          role="dialog"
          aria-label={t('chatTitle')}
        >
          <div className={styles.head}>
            <div className={styles.headText}>
              <p className={styles.headTitle}>{t('chatTitle')}</p>
              <p className={styles.headSub}>{t('chatSubtitle')}</p>
            </div>
            <button
              type="button"
              className={styles.close}
              onClick={() => setOpen(false)}
              aria-label={t('chatClose')}
            >
              <i className="fa-solid fa-xmark" aria-hidden />
            </button>
          </div>

          <div className={styles.body}>
            <div className={styles.bubbleBot}>{t('chatGreeting')}</div>

            {active ? (
              <>
                <div className={styles.bubbleUser}>{label(active)}</div>
                <div className={styles.bubbleBot}>{answer(active)}</div>
                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.backBtn}
                    onClick={() => setActiveId(null)}
                  >
                    {t('chatBack')}
                  </button>
                  {active.shop ? (
                    <Link
                      to={active.shop}
                      className={styles.linkBtn}
                      onClick={() => setOpen(false)}
                    >
                      {t('chatShopCta')}
                    </Link>
                  ) : null}
                </div>
              </>
            ) : (
              <div className={styles.questions}>
                {PLANT_CHAT_FAQ.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={styles.qBtn}
                    onClick={() => setActiveId(item.id)}
                  >
                    {label(item)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
