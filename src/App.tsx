import { useCallback, useEffect, useRef, useState } from "react";

type IconName = "arrow" | "book" | "check" | "music" | "spark" | "volume";

function Icon({ name, size = 24 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    book: <><path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H11v17H7.5A3.5 3.5 0 0 0 4 22V5.5Z" /><path d="M20 5.5A3.5 3.5 0 0 0 16.5 2H13v17h3.5A3.5 3.5 0 0 1 20 22V5.5Z" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    music: <><path d="M9 18V5l10-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="16" cy="16" r="3" /></>,
    spark: <><path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" /><path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z" /></>,
    volume: <><path d="M11 5 6 9H2v6h4l5 4V5Z" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M18 6a8.5 8.5 0 0 1 0 12" /></>,
  };

  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    >
      {paths[name]}
    </svg>
  );
}

function Badge({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return <div className={`badge ${light ? "badge-light" : ""}`}>{children}</div>;
}

function WordCard({
  word,
  sound,
  meaning,
  color,
}: {
  word: string;
  sound: string;
  meaning: string;
  color: string;
}) {
  return (
    <div className="word-card" style={{ "--card-color": color } as React.CSSProperties}>
      <div className="word-card-top">
        <span className="word-name">{word}</span>
        <span className="sound">{sound}</span>
      </div>
      <div className="word-meaning">{meaning}</div>
    </div>
  );
}

function Lyric({ children }: { children: React.ReactNode }) {
  return (
    <div className="lyric">
      <Icon name="volume" size={20} />
      <span>{children}</span>
    </div>
  );
}

const notes = [
  { note: "DO", clue: "Doe", meaning: "一只小母鹿", color: "#f26b5b" },
  { note: "RE", clue: "Ray", meaning: "一缕金色阳光", color: "#ef9f35" },
  { note: "MI", clue: "Me", meaning: "我称呼自己", color: "#e5bd35" },
  { note: "FA", clue: "Far", meaning: "很远很远", color: "#4da886" },
  { note: "SOL", clue: "Sew", meaning: "针线缝补", color: "#3996a8" },
  { note: "LA", clue: "La", meaning: "跟在 So 后", color: "#506fb3" },
  { note: "SI", clue: "Tea", meaning: "茶与果酱面包", color: "#9b6bb0" },
];

export default function App() {
  const [page, setPage] = useState(0);
  const audioSrc = "/course-music.mp3";
  const audioName = "Do-Re-Mi · 音乐之声";
  const [isPlaying, setIsPlaying] = useState(false);
  const touchStart = useRef(0);
  const wheelLock = useRef(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const total = 18;

  const goTo = useCallback((next: number) => {
    setPage(Math.max(0, Math.min(total - 1, next)));
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (["ArrowDown", "ArrowRight", "PageDown", " "].includes(event.key)) {
        event.preventDefault();
        setPage((current) => Math.min(total - 1, current + 1));
      }
      if (["ArrowUp", "ArrowLeft", "PageUp"].includes(event.key)) {
        event.preventDefault();
        setPage((current) => Math.max(0, current - 1));
      }
      if (event.key === "Home") setPage(0);
      if (event.key === "End") setPage(total - 1);
    };
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < 18 || wheelLock.current) return;
      wheelLock.current = true;
      setPage((current) =>
        event.deltaY > 0 ? Math.min(total - 1, current + 1) : Math.max(0, current - 1),
      );
      window.setTimeout(() => (wheelLock.current = false), 800);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("wheel", onWheel);
    };
  }, []);

  useEffect(() => {
    const startMusic = () => {
      void audioRef.current?.play().catch(() => {
        // Browsers may require the first user interaction before playing audio.
      });
      window.removeEventListener("pointerdown", startMusic);
      window.removeEventListener("keydown", startMusic);
      window.removeEventListener("touchstart", startMusic);
    };

    const timer = window.setTimeout(startMusic, 100);
    window.addEventListener("pointerdown", startMusic, { once: true });
    window.addEventListener("keydown", startMusic, { once: true });
    window.addEventListener("touchstart", startMusic, { once: true });

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pointerdown", startMusic);
      window.removeEventListener("keydown", startMusic);
      window.removeEventListener("touchstart", startMusic);
    };
  }, []);

  const toggleMusic = async () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      await audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  };

  return (
    <main
      className="app-shell"
      onTouchStart={(event) => (touchStart.current = event.touches[0].clientY)}
      onTouchEnd={(event) => {
        const distance = touchStart.current - event.changedTouches[0].clientY;
        if (Math.abs(distance) > 48) goTo(page + (distance > 0 ? 1 : -1));
      }}
    >
      <header className="topbar">
        <div className="brand"><span className="brand-mark"><Icon name="music" size={18} /></span>盲校 · WEEK 02</div>
        <div className="page-count"><strong>{String(page + 1).padStart(2, "0")}</strong> / {total}</div>
      </header>

      <nav className="rail" aria-label="页面导航">
        {Array.from({ length: total }, (_, index) => (
          <button
            aria-label={`前往第 ${index + 1} 页`}
            aria-current={index === page ? "page" : undefined}
            className={`rail-dot ${index === page ? "active" : ""}`}
            key={index}
            onClick={() => goTo(index)}
          ><span>{String(index + 1).padStart(2, "0")}</span></button>
        ))}
      </nav>

      <div className="slides" style={{ transform: `translateY(-${page * 100}vh)` }}>
        <section className="slide hero">
          <div className="hero-orbit orbit-one" />
          <div className="hero-orbit orbit-two" />
          <div className="content hero-content">
            <Badge>盲校第二周课程 · 音乐英语启蒙</Badge>
            <div className="eyebrow">SING · LEARN · REMEMBER</div>
            <h1>跟着旋律，<br /><em>唱懂英语。</em></h1>
            <p className="hero-copy">从 Do-Re-Mi 的七个音符出发，在熟悉的旋律里认识单词、理解句子，也学会勇敢开口。</p>
            <button className="primary-button" onClick={() => goTo(1)}>
              开始本周旅程 <Icon name="arrow" size={20} />
            </button>
          </div>
          <div className="note-stack" aria-hidden="true">
            <span className="floating-note">DO</span><span className="floating-note">RE</span>
            <span className="floating-note">MI</span><span className="floating-note">FA</span>
          </div>
        </section>

        <section className="slide cream">
          <div className="content wide">
            <Badge>01 · MEET THE NOTES</Badge>
            <div className="section-heading">
              <div><div className="kicker">先认识新朋友</div><h2>七个音符，<br />七个记忆小机关</h2></div>
              <p>英文歌词把每个音符变成了一个发音相近的词。唱的是音阶，记住的却是一整串鲜活的英文。</p>
            </div>
            <div className="note-grid">
              {notes.map((item, index) => (
                <button
                  className="note-card"
                  key={item.note}
                  onClick={() => goTo(index + 2)}
                  style={{ "--note-color": item.color, "--delay": `${index * 70}ms` } as React.CSSProperties}
                >
                  <div className="note-number">{index + 1}</div><strong>{item.note}</strong><span>{item.clue}</span><small>{item.meaning}</small>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="slide coral">
          <div className="content split">
            <div className="lesson-index">01</div>
            <div>
              <Badge light>DO · DOE</Badge>
              <h2>第一个音符，<br />是一只小鹿</h2>
              <Lyric>Doe — a deer, a female deer</Lyric>
              <p className="tip"><Icon name="spark" size={18} /> 用相似的发音，把抽象音符变成具体画面。</p>
            </div>
            <div className="visual-poster sun-poster">
              <div className="sun" /><div className="hill hill-back" /><div className="hill hill-front" />
              <div className="poster-caption single"><span>DOE</span><small>a female deer · 一只小母鹿</small></div>
            </div>
          </div>
        </section>

        <section className="slide yellow">
          <div className="content split">
            <div className="lesson-index">02</div>
            <div>
              <Badge>RE · RAY</Badge>
              <h2>第二个音符，<br />是一缕金色阳光</h2>
              <div className="lyric dark"><Icon name="volume" size={20} /><span>Ray — a drop of golden sun</span></div>
              <p className="tip"><Icon name="spark" size={18} /> Ray 是“光线”，golden sun 是“金色阳光”。</p>
            </div>
            <div className="ray-art"><div className="ray-sun" /><i /><i /><i /><i /><strong>RAY</strong></div>
          </div>
        </section>

        <section className="slide navy">
          <div className="content split reverse">
            <div className="lesson-index">03</div>
            <div className="visual-poster road-poster">
              <div className="road-line line-one" /><div className="road-line line-two" />
              <div className="road-word">ME</div>
            </div>
            <div>
              <Badge light>MI · ME</Badge>
              <h2>第三个音符，<br />从认识自己开始</h2>
              <Lyric>Me — a name I call myself</Lyric>
              <p className="tip"><Icon name="spark" size={18} /> myself 的意思是“我自己”。</p>
            </div>
          </div>
        </section>

        <section className="slide ivory">
          <div className="content split">
            <div className="lesson-index">04</div>
            <div>
              <Badge>FA · FAR</Badge>
              <h2>第四个音符，<br />跑向很远的地方</h2>
              <div className="lyric dark"><Icon name="volume" size={20} /><span>Far — a long, long way to run</span></div>
              <p className="tip"><Icon name="spark" size={18} /> a long way 是“一段很长的路”。</p>
            </div>
            <div className="far-art"><span>FA</span><i /><strong>FAR</strong></div>
          </div>
        </section>

        <section className="slide teal">
          <div className="content split">
            <div className="lesson-index">05</div>
            <div>
              <Badge light>SOL · SEW</Badge>
              <h2>第五个音符，<br />像针线穿过布面</h2>
              <Lyric>Sew — a needle pulling thread</Lyric>
              <div className="mini-glossary"><span><b>needle</b> 针</span><span><b>thread</b> 线</span></div>
            </div>
            <div className="thread-art" aria-hidden="true">
              <svg viewBox="0 0 420 420"><path d="M40 310C85 90 164 84 184 208c16 100 143 128 192-50" /><circle cx="40" cy="310" r="9" /><circle cx="376" cy="158" r="9" /></svg>
              <span className="thread-so">SOL</span>
            </div>
          </div>
        </section>

        <section className="slide blue">
          <div className="content split">
            <div className="lesson-index">06</div>
            <div>
              <Badge light>LA · FOLLOW</Badge>
              <h2>第六个音符，<br />紧紧跟在后面</h2>
              <Lyric>La — a note to follow Sew</Lyric>
              <div className="mini-glossary"><span><b>note</b> 音符</span><span><b>follow</b> 跟在后面</span></div>
            </div>
            <div className="follow-art"><span>SOL</span><i>→</i><strong>LA</strong></div>
          </div>
        </section>

        <section className="slide plum">
          <div className="content split reverse">
            <div className="lesson-index">07</div>
            <div className="tea-visual">
              <div className="cup"><span className="steam steam-one" /><span className="steam steam-two" /><span className="handle" /></div>
              <div className="bread">BREAD <span>+</span> JAM</div>
            </div>
            <div>
              <Badge light>SI · TEA</Badge>
              <h2>最后一个音符，<br />是一顿小茶点</h2>
              <Lyric>Tea — a drink with jam and bread</Lyric>
              <p className="body-copy">第七个音符写作 <strong>Si</strong>，在一些英语音阶中也会写作 <strong>Ti</strong>。歌词借用发音相近的 <strong>tea</strong> 帮助记忆。</p>
            </div>
          </div>
        </section>

        <section className="slide yellow">
          <div className="content wide">
            <Badge>02 · READ THE SENTENCE</Badge>
            <div className="sentence-title"><h2>把词连起来，<br />句子就有了方向。</h2></div>
            <div className="sentence-flow">
              <span>That</span><i>那件事</i><b>→</b><span>will bring</span><i>将会带领</i><b>→</b><span>us</span><i>我们</i><b>→</b><span>back to “Doe”</span><i>回到 Doe</i>
            </div>
            <div className="full-lyric">“That will bring us back to Doe, oh-oh-oh.”</div>
          </div>
        </section>

        <section className="slide cream">
          <div className="content wide">
            <Badge>03 · WORD BANK</Badge>
            <div className="section-heading compact">
              <div><div className="kicker">本周核心词汇</div><h2>不只会唱，<br />更要读懂。</h2></div>
              <p>把词放回歌词里理解，声音、画面和意思会一起留在记忆里。</p>
            </div>
            <div className="word-grid">
              <WordCard word="note" sound="/nəʊt/" meaning="音符" color="#f26b5b" />
              <WordCard word="follow" sound="/ˈfɒləʊ/" meaning="跟随；跟在后面" color="#3996a8" />
              <WordCard word="with" sound="/wɪð/" meaning="和；伴有" color="#506fb3" />
              <WordCard word="bring" sound="/brɪŋ/" meaning="带来；带领" color="#ef9f35" />
              <WordCard word="back to" sound="/bæk tuː/" meaning="回到……" color="#9b6bb0" />
              <WordCard word="myself" sound="/maɪˈself/" meaning="我自己" color="#4da886" />
            </div>
          </div>
        </section>

        <section className="slide ivory">
          <div className="content wide">
            <Badge>04 · PRONUNCIATION</Badge>
            <div className="lesson-board">
              <div>
                <div className="kicker">用耳朵分辨相似发音</div>
                <h2>音符是声音，<br />单词是画面。</h2>
                <p className="board-copy">先听音符，再听对应单词。它们听起来相近，却有不同的拼写和意思。</p>
              </div>
              <div className="sound-pairs">
                <div><span>DO</span><b>sounds like</b><strong>DOE</strong><small>母鹿</small></div>
                <div><span>RE</span><b>sounds like</b><strong>RAY</strong><small>光线</small></div>
                <div><span>MI</span><b>sounds like</b><strong>ME</strong><small>我</small></div>
                <div><span>SI</span><b>sounds like</b><strong>TEA</strong><small>茶</small></div>
              </div>
            </div>
          </div>
        </section>

        <section className="slide coral">
          <div className="content split">
            <div className="lesson-index">LISTEN</div>
            <div>
              <Badge light>05 · MUSIC LAB</Badge>
              <h2>先听一遍，<br />再跟唱一遍。</h2>
              <p className="body-copy">聆听老师准备的 Do-Re-Mi 音频。播放器会一直保留在页面左下角，翻页时音乐不会中断。</p>
            </div>
            <div className="sound-stage" aria-hidden="true">
              {[34, 68, 48, 92, 60, 115, 78, 45, 100, 62].map((height, index) => (
                <i key={index} style={{ height }} />
              ))}
            </div>
          </div>
        </section>

        <section className="slide navy">
          <div className="content wide">
            <Badge light>06 · FEEL THE RHYTHM</Badge>
            <div className="rhythm-layout">
              <div><div className="kicker light">拍拍手，找节拍</div><h2>一句歌词，<br />四个节奏点。</h2></div>
              <div className="beat-line">
                <div><b>TEA</b><span>1</span></div><i />
                <div><b>A DRINK</b><span>2</span></div><i />
                <div><b>WITH JAM</b><span>3</span></div><i />
                <div><b>AND BREAD</b><span>4</span></div>
              </div>
            </div>
          </div>
        </section>

        <section className="slide yellow">
          <div className="content wide">
            <Badge>08 · GRAMMAR CLUE</Badge>
            <div className="grammar-layout">
              <div><div className="kicker">发现句子的时间线索</div><h2><em>will</em>，告诉我们<br />接下来会发生什么。</h2></div>
              <div className="grammar-card">
                <small>FUTURE · 将来</small>
                <strong>will + 动词原形</strong>
                <p>That <b>will bring</b> us back to Doe.</p>
                <div><span>will</span> 将会 <span>bring</span> 带领</div>
              </div>
            </div>
          </div>
        </section>

        <section className="slide bubble-slide">
          <div className="bubble-field" aria-hidden="true">
            {Array.from({ length: 63 }, (_, index) => {
              const note = notes[index % notes.length];
              return (
                <span
                  className={`note-bubble bubble-${(index % 14) + 1}`}
                  key={index}
                  style={{
                    "--bubble-color": note.color,
                    "--bubble-delay": `${-(index % 9) * 0.6}s`,
                    "--bubble-x": `${(index * 37) % 96}%`,
                    "--bubble-y": `${(index * 53) % 94}%`,
                    "--bubble-size": `${48 + ((index * 23) % 104)}px`,
                    "--drift-x": `${-34 + ((index * 19) % 69)}px`,
                    "--drift-y": `${-30 + ((index * 29) % 63)}px`,
                    "--bubble-duration": `${4.8 + (index % 8) * 0.55}s`,
                  } as React.CSSProperties}
                >
                  {note.note}
                </span>
              );
            })}
          </div>
          <div className="content bubble-content">
            <Badge light>09 · NOTE UNIVERSE</Badge>
            <h2>每一个音符，<br />都在快乐冒泡。</h2>
            <p>DO · RE · MI · FA · SOL · LA · SI</p>
          </div>
        </section>

        <section className="slide blue">
          <div className="content wide">
            <Badge light>04 · WHAT WE LEARNED</Badge>
            <div className="learned-layout">
              <div><div className="kicker light">这周，我们学会了什么？</div><h2>一首歌，<br />四种成长。</h2></div>
              <div className="outcomes">
                <div><span>01</span><Icon name="music" /><strong>音乐感知</strong><p>唱准 Do 到 Si 的七个音符。</p></div>
                <div><span>02</span><Icon name="book" /><strong>词汇理解</strong><p>掌握 note、follow、bring 等关键词。</p></div>
                <div><span>03</span><Icon name="volume" /><strong>自然表达</strong><p>在旋律里练习英语节奏与发音。</p></div>
                <div><span>04</span><Icon name="spark" /><strong>联想记忆</strong><p>用相似发音与画面加深记忆。</p></div>
              </div>
            </div>
          </div>
        </section>

        <section className="slide finale">
          <div className="finale-rings" aria-hidden="true"><span /><span /><span /></div>
          <div className="content finale-content">
            <Badge>WEEK 02 · COMPLETE</Badge>
            <div className="finale-check"><Icon name="check" size={46} /></div>
            <h2>会唱，会读，<br /><em>也会表达。</em></h2>
            <p>让每一次开口，都像旋律一样自然。<br />下一周，我们继续把英语唱进生活里。</p>
            <button className="secondary-button" onClick={() => goTo(0)}>再看一遍 <Icon name="arrow" size={18} /></button>
          </div>
          <div className="scale-strip">{notes.map((item) => <span key={item.note} style={{ background: item.color }}>{item.note}</span>)}</div>
        </section>
      </div>

      <div className="audio-dock">
        <audio
          ref={audioRef}
          src={audioSrc || undefined}
          autoPlay
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
        />
        <button aria-label={isPlaying ? "暂停音乐" : "播放或添加音乐"} onClick={toggleMusic}>
          <Icon name={isPlaying ? "volume" : "music"} size={18} />
        </button>
        <div><small>{isPlaying ? "NOW PLAYING" : "COURSE AUDIO"}</small><strong>{audioName}</strong></div>
      </div>

      <div className="scroll-hint"><span>SCROLL</span><i /></div>
      {page >= 2 && page < 9 && (
        <nav className="scale-nav" aria-label="七个音符快捷导航">
          {notes.map((item, index) => (
            <button
              key={item.note}
              aria-label={`跳转到 ${item.note} 音符页面`}
              className={page === index + 2 ? "active" : ""}
              onClick={() => goTo(index + 2)}
            >
              {item.note}
            </button>
          ))}
        </nav>
      )}
      <div className="page-controls">
        <button aria-label="上一页" disabled={page === 0} onClick={() => goTo(page - 1)}>↑</button>
        <button aria-label="下一页" disabled={page === total - 1} onClick={() => goTo(page + 1)}>↓</button>
      </div>
    </main>
  );
}
