import { useState, useEffect, useRef, useCallback } from "react";

// ── Fake data generators ──
const STRAINS = ["GS115", "X-33", "KM71", "CBS7435", "SMD1168"];
const GENE_NAMES = [
  "GQ67_04563","GQ67_02891","GQ67_05102","GQ67_01447","GQ67_03788",
  "GQ67_00921","GQ67_04210","GQ67_01563","GQ67_02334","GQ67_05501",
  "GQ67_03102","GQ67_00445","GQ67_04890","GQ67_01678","GQ67_02567",
  "GQ67_03456","GQ67_00789","GQ67_05234","GQ67_01901","GQ67_04078",
  "GQ67_02145","GQ67_03567","GQ67_00234","GQ67_05678","GQ67_01345",
  "GQ67_04456","GQ67_02789","GQ67_03901","GQ67_00567","GQ67_05012",
  "GQ67_01234","GQ67_04345","GQ67_02456","GQ67_03678","GQ67_00890",
  "GQ67_05123","GQ67_01567","GQ67_04678","GQ67_02012","GQ67_03234",
  "GQ67_00345","GQ67_05456","GQ67_01789","GQ67_04901","GQ67_02678",
  "GQ67_03012","GQ67_00123","GQ67_05789","GQ67_01456","GQ67_04234",
];
const FUNCTIONS = [
  "Chaperona do ER - enovelamento de proteínas",
  "Translocon Sec61 - translocação ao ER",
  "GPI-anchor biosynthesis - ancoramento à membrana",
  "Folding catalyst - formação de pontes dissulfeto",
  "Vesicular trafficking - transporte Golgi→membrana",
  "UPR sensor - resposta a proteínas mal-enoveladas",
  "Glycosylation enzyme - N-glicosilação",
  "Signal peptidase - clivagem de peptídeo sinal",
  "COPII coat protein - vesículas ER→Golgi",
  "Proteasome subunit - degradação ERAD",
];
const CATEGORIES = ["UNIVERSAL", "CEPA-ESPECÍFICO", "HOUSEKEEPING"];
const CAT_COLORS = { UNIVERSAL: "#22C55E", "CEPA-ESPECÍFICO": "#F59E0B", HOUSEKEEPING: "#94A3B8" };

function generateGenes() {
  return GENE_NAMES.map((name, i) => {
    const secretion = Math.random() * 0.6 + 0.35;
    const strain_spec = Math.random();
    const cat = secretion > 0.7 ? (strain_spec > 0.5 ? "UNIVERSAL" : "CEPA-ESPECÍFICO") : "HOUSEKEEPING";
    return {
      id: i,
      name,
      type: i < 25 ? "OE" : "KO",
      secretion: +secretion.toFixed(3),
      strain_specificity: +strain_spec.toFixed(3),
      confidence: +(Math.random() * 0.3 + 0.65).toFixed(3),
      category: cat,
      function: FUNCTIONS[i % FUNCTIONS.length],
      strain: STRAINS[Math.floor(Math.random() * STRAINS.length)],
    };
  });
}

const GENES = generateGenes();

// ── Styles ──
const colors = {
  bg: "#0F1117", card: "#1A1D2E", card2: "#252840", card3: "#1E2235",
  purple: "#9B6DFF", cyan: "#2EC4B6", blue: "#3B82F6",
  green: "#22C55E", orange: "#F59E0B", red: "#EF4444",
  gray: "#94A3B8", grayDark: "#64748B", white: "#F8FAFC",
  text: "#E2E8F0", textMuted: "#94A3B8",
};

// ── Components ──

function NavBar({ currentStep, onNavigate, steps }) {
  const navSteps = steps || [
    { id: "home", label: "Início", icon: "◈" },
    { id: "upload", label: "Upload", icon: "↑" },
    { id: "pipeline", label: "Pipeline", icon: "⚡" },
    { id: "dashboard", label: "Dashboard", icon: "◫" },
    { id: "report", label: "Report", icon: "📋" },
  ];
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: `linear-gradient(180deg, ${colors.bg}ee 0%, ${colors.bg}cc 100%)`,
      backdropFilter: "blur(20px)", borderBottom: `1px solid ${colors.card2}`,
      padding: "0 24px", height: 56, display: "flex", alignItems: "center", gap: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginRight: 40 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: `linear-gradient(135deg, ${colors.purple}, ${colors.cyan})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, fontWeight: 800, color: "#fff",
        }}>A</div>
        <span style={{ fontSize: 18, fontWeight: 700, color: colors.white, fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.5px" }}>
          ArkBio<span style={{ color: colors.cyan }}>AI</span>
        </span>
      </div>
      <div style={{ display: "flex", gap: 2, flex: 1 }}>
        {navSteps.map((step, i) => {
          const active = currentStep === step.id;
          const passed = navSteps.findIndex(s => s.id === currentStep) > i;
          return (
            <button key={step.id} onClick={() => onNavigate(step.id)}
              style={{
                background: active ? colors.card2 : "transparent",
                border: "none", borderRadius: 8, padding: "8px 16px",
                color: active ? colors.cyan : passed ? colors.green : colors.textMuted,
                fontSize: 13, fontWeight: active ? 600 : 400, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6,
                fontFamily: "'Outfit', sans-serif", transition: "all 0.2s",
              }}>
              <span style={{ fontSize: 14 }}>{step.icon}</span>
              {step.label}
              {passed && <span style={{ color: colors.green, fontSize: 12 }}>✓</span>}
            </button>
          );
        })}
      </div>
      <div style={{
        padding: "6px 14px", borderRadius: 20,
        background: `${colors.green}18`, border: `1px solid ${colors.green}40`,
        fontSize: 11, color: colors.green, fontWeight: 600,
      }}>DEMO</div>
    </div>
  );
}

function HomeScreen({ onStart, onExplore }) {
  return (
    <div style={{ padding: "80px 40px 40px", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 60, marginTop: 40 }}>
        <h1 style={{
          fontSize: 52, fontWeight: 800, color: colors.white,
          fontFamily: "'Outfit', sans-serif", letterSpacing: "-2px", margin: 0,
          lineHeight: 1.1,
        }}>
          Priorize alvos genéticos<br />
          <span style={{
            background: `linear-gradient(135deg, ${colors.purple}, ${colors.cyan})`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>com inteligência artificial</span>
        </h1>
        <p style={{ fontSize: 18, color: colors.textMuted, marginTop: 20, lineHeight: 1.6, maxWidth: 600, margin: "20px auto 0" }}>
          Upload seus dados transcriptômicos. Receba uma lista priorizada de alvos — cepa-específica, com scores de confiança e relatórios interpretativos.
        </p>
      </div>
      <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" }}>
        <div onClick={onStart} style={{
          background: colors.card, borderRadius: 16, padding: 36, width: 380,
          cursor: "pointer", border: `2px solid ${colors.cyan}30`,
          transition: "all 0.3s", position: "relative", overflow: "hidden",
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = colors.cyan; e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = `${colors.cyan}30`; e.currentTarget.style.transform = "translateY(0)"; }}
        >
          <div style={{
            position: "absolute", top: -40, right: -40, width: 120, height: 120,
            borderRadius: "50%", background: `${colors.cyan}08`,
          }} />
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: `${colors.cyan}15`, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, marginBottom: 20,
          }}>↑</div>
          <h3 style={{ fontSize: 22, fontWeight: 700, color: colors.white, margin: "0 0 8px", fontFamily: "'Outfit', sans-serif" }}>
            Tenho meus dados
          </h3>
          <p style={{ fontSize: 14, color: colors.textMuted, margin: 0, lineHeight: 1.5 }}>
            Upload de CSV com dados de expressão gênica. Pipeline ML completo com análise cepa-específica.
          </p>
          <div style={{
            marginTop: 20, padding: "8px 16px", background: colors.cyan,
            borderRadius: 8, display: "inline-block",
            fontSize: 13, fontWeight: 600, color: colors.bg,
          }}>Começar análise →</div>
        </div>

        <div onClick={onExplore} style={{
          background: colors.card, borderRadius: 16, padding: 36, width: 380,
          cursor: "pointer", border: `2px solid ${colors.purple}30`,
          transition: "all 0.3s", position: "relative", overflow: "hidden",
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = colors.purple; e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = `${colors.purple}30`; e.currentTarget.style.transform = "translateY(0)"; }}
        >
          <div style={{
            position: "absolute", top: -40, right: -40, width: 120, height: 120,
            borderRadius: "50%", background: `${colors.purple}08`,
          }} />
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: `${colors.purple}15`, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, marginBottom: 20,
          }}>🔬</div>
          <h3 style={{ fontSize: 22, fontWeight: 700, color: colors.white, margin: "0 0 8px", fontFamily: "'Outfit', sans-serif" }}>
            Quero explorar
          </h3>
          <p style={{ fontSize: 14, color: colors.textMuted, margin: 0, lineHeight: 1.5 }}>
            Explore datasets pré-curados. Selecione organismo e cepa para rankings instantâneos.
          </p>
          <div style={{
            marginTop: 20, padding: "8px 16px", background: `${colors.purple}20`,
            border: `1px solid ${colors.purple}60`,
            borderRadius: 8, display: "inline-block",
            fontSize: 13, fontWeight: 600, color: colors.purple,
          }}>Explorar biblioteca →</div>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{
        display: "flex", gap: 40, justifyContent: "center", marginTop: 60,
        padding: "24px 0", borderTop: `1px solid ${colors.card2}`,
      }}>
        {[
          { v: "97%", l: "Bal. Accuracy" },
          { v: "5.116", l: "Genes analisados" },
          { v: "6", l: "Modelos ML" },
          { v: "100", l: "Genes priorizados" },
        ].map((s, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: colors.cyan, fontFamily: "'Outfit', sans-serif" }}>{s.v}</div>
            <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UploadScreen({ onNext }) {
  const [file, setFile] = useState(null);
  const [detected, setDetected] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [samples] = useState([
    { id: "S01", condition: "High secretion", strain: "GS115", auto: true },
    { id: "S02", condition: "High secretion", strain: "GS115", auto: true },
    { id: "S03", condition: "Low secretion", strain: "GS115", auto: true },
    { id: "S04", condition: "Low secretion", strain: "GS115", auto: true },
    { id: "S05", condition: "High secretion", strain: "X-33", auto: true },
    { id: "S06", condition: "Low secretion", strain: "X-33", auto: true },
    { id: "S07", condition: "High secretion", strain: "KM71", auto: true },
    { id: "S08", condition: "Low secretion", strain: "KM71", auto: true },
    { id: "S09", condition: "High secretion", strain: "GS115", auto: true },
    { id: "S10", condition: "Low secretion", strain: "CBS7435", auto: true },
    { id: "S11", condition: "High secretion", strain: "X-33", auto: true },
    { id: "S12", condition: "Low secretion", strain: "KM71", auto: true },
  ]);

  useEffect(() => {
    if (file && !detected) {
      const timer = setTimeout(() => setDetected(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [file, detected]);

  return (
    <div style={{ padding: "80px 40px 40px", maxWidth: 900, margin: "0 auto" }}>
      <h2 style={{ fontSize: 32, fontWeight: 700, color: colors.white, fontFamily: "'Outfit', sans-serif", margin: "40px 0 8px" }}>
        Upload & Classificação
      </h2>
      <p style={{ fontSize: 15, color: colors.textMuted, marginBottom: 30 }}>
        Arraste seu CSV de expressão gênica. O sistema detecta metadados automaticamente.
      </p>

      {!file ? (
        <div
          onClick={() => setFile("expression_data.csv")}
          style={{
            border: `2px dashed ${colors.cyan}50`, borderRadius: 16,
            padding: 60, textAlign: "center", cursor: "pointer",
            background: `${colors.cyan}05`, transition: "all 0.3s",
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = colors.cyan}
          onMouseLeave={e => e.currentTarget.style.borderColor = `${colors.cyan}50`}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>↑</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: colors.white }}>
            Arraste seu arquivo CSV aqui
          </div>
          <div style={{ fontSize: 14, color: colors.textMuted, marginTop: 8 }}>
            ou clique para selecionar (demo: clique para simular upload)
          </div>
        </div>
      ) : !detected ? (
        <div style={{
          background: colors.card, borderRadius: 16, padding: 40,
          textAlign: "center", border: `1px solid ${colors.card2}`,
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: "50%",
            border: `3px solid ${colors.cyan}30`, borderTopColor: colors.cyan,
            animation: "spin 1s linear infinite", margin: "0 auto 20px",
          }} />
          <div style={{ fontSize: 16, color: colors.white, fontWeight: 600 }}>Analisando expression_data.csv...</div>
          <div style={{ fontSize: 13, color: colors.textMuted, marginTop: 8 }}>Detectando formato, colunas e metadados</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Detection summary */}
          <div style={{
            background: colors.card, borderRadius: 12, padding: 24,
            border: `1px solid ${colors.green}30`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <span style={{ color: colors.green, fontSize: 18 }}>✓</span>
              <span style={{ fontSize: 16, fontWeight: 600, color: colors.white }}>Arquivo detectado com sucesso</span>
            </div>
            <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
              {[
                { l: "Amostras", v: "12" },
                { l: "Genes", v: "5.116" },
                { l: "Formato", v: "Counts (raw)" },
                { l: "Organismo", v: "K. phaffii" },
              ].map((item, i) => (
                <div key={i}>
                  <div style={{ fontSize: 11, color: colors.textMuted, textTransform: "uppercase", letterSpacing: 1 }}>{item.l}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: colors.cyan, fontFamily: "'Outfit', sans-serif" }}>{item.v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Sample table */}
          <div style={{
            background: colors.card, borderRadius: 12, padding: 24,
            border: `1px solid ${colors.card2}`,
          }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: colors.white, marginBottom: 4 }}>
              Metadados detectados
            </div>
            <div style={{ fontSize: 13, color: colors.textMuted, marginBottom: 16 }}>
              Confirme ou ajuste os pontos críticos antes de continuar.
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Amostra", "Condição", "Cepa", "Status"].map(h => (
                      <th key={h} style={{
                        textAlign: "left", padding: "10px 14px",
                        fontSize: 11, color: colors.textMuted, textTransform: "uppercase",
                        letterSpacing: 1, borderBottom: `1px solid ${colors.card2}`,
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {samples.map((s, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : `${colors.card2}40` }}>
                      <td style={{ padding: "10px 14px", fontSize: 14, color: colors.white, fontFamily: "monospace" }}>{s.id}</td>
                      <td style={{ padding: "10px 14px" }}>
                        <span style={{
                          padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: 600,
                          background: s.condition.includes("High") ? `${colors.green}18` : `${colors.orange}18`,
                          color: s.condition.includes("High") ? colors.green : colors.orange,
                        }}>{s.condition}</span>
                      </td>
                      <td style={{ padding: "10px 14px", fontSize: 14, color: colors.purple, fontWeight: 500 }}>{s.strain}</td>
                      <td style={{ padding: "10px 14px" }}>
                        <span style={{ fontSize: 12, color: colors.green }}>✓ Auto</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button onClick={() => { setFile(null); setDetected(false); }} style={{
              padding: "12px 24px", borderRadius: 10, border: `1px solid ${colors.card2}`,
              background: "transparent", color: colors.textMuted, fontSize: 14,
              cursor: "pointer", fontWeight: 500,
            }}>Cancelar</button>
            <button onClick={onNext} style={{
              padding: "12px 28px", borderRadius: 10, border: "none",
              background: colors.cyan, color: colors.bg, fontSize: 14,
              cursor: "pointer", fontWeight: 700,
            }}>Confirmar e Executar ⚡</button>
          </div>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}

function PipelineScreen({ onNext }) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const steps = [
    { label: "Convertendo counts → TPM", duration: 12 },
    { label: "Feature selection (ANOVA + RF)", duration: 20 },
    { label: "Treinando Random Forest", duration: 10 },
    { label: "Treinando XGBoost", duration: 10 },
    { label: "Treinando LightGBM", duration: 8 },
    { label: "Treinando SVM", duration: 8 },
    { label: "Treinando MLP", duration: 8 },
    { label: "Treinando Logistic Regression", duration: 5 },
    { label: "Ensemble Bayesian Model Averaging", duration: 8 },
    { label: "Gerando Pareto (secreção × cepa)", duration: 6 },
    { label: "Gerando reports LLM", duration: 5 },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) { clearInterval(timer); return 100; }
        return prev + 0.8;
      });
    }, 50);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let acc = 0;
    for (let i = 0; i < steps.length; i++) {
      acc += steps[i].duration;
      if (progress < acc) { setCurrentStep(i); return; }
    }
    setCurrentStep(steps.length - 1);
  }, [progress]);

  const done = progress >= 100;

  return (
    <div style={{ padding: "80px 40px 40px", maxWidth: 700, margin: "0 auto" }}>
      <h2 style={{ fontSize: 32, fontWeight: 700, color: colors.white, fontFamily: "'Outfit', sans-serif", margin: "40px 0 8px" }}>
        {done ? "Pipeline Completo ✓" : "Executando Pipeline ML..."}
      </h2>
      <p style={{ fontSize: 15, color: colors.textMuted, marginBottom: 30 }}>
        {done ? "Seus resultados estão prontos." : "6 modelos sendo treinados e otimizados com Optuna."}
      </p>

      {/* Progress bar */}
      <div style={{
        background: colors.card, borderRadius: 12, height: 8, overflow: "hidden",
        marginBottom: 32,
      }}>
        <div style={{
          height: "100%", borderRadius: 12, transition: "width 0.3s",
          width: `${Math.min(progress, 100)}%`,
          background: done ? colors.green : `linear-gradient(90deg, ${colors.purple}, ${colors.cyan})`,
        }} />
      </div>

      {/* Steps */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {steps.map((step, i) => {
          const active = i === currentStep && !done;
          const completed = i < currentStep || done;
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "10px 16px",
              borderRadius: 10, background: active ? `${colors.cyan}10` : "transparent",
              border: active ? `1px solid ${colors.cyan}30` : "1px solid transparent",
              transition: "all 0.3s",
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700,
                background: completed ? colors.green : active ? colors.cyan : colors.card2,
                color: completed || active ? colors.bg : colors.grayDark,
              }}>
                {completed ? "✓" : i + 1}
              </div>
              <span style={{
                fontSize: 14, fontWeight: active ? 600 : 400,
                color: completed ? colors.green : active ? colors.white : colors.textMuted,
              }}>{step.label}</span>
              {active && (
                <div style={{
                  marginLeft: "auto", width: 16, height: 16, borderRadius: "50%",
                  border: `2px solid ${colors.cyan}30`, borderTopColor: colors.cyan,
                  animation: "spin 0.8s linear infinite",
                }} />
              )}
            </div>
          );
        })}
      </div>

      {done && (
        <button onClick={onNext} style={{
          marginTop: 32, padding: "14px 32px", borderRadius: 12, border: "none",
          background: colors.green, color: colors.bg, fontSize: 16,
          cursor: "pointer", fontWeight: 700, width: "100%",
        }}>Ver Resultados →</button>
      )}
    </div>
  );
}

function DashboardScreen({ onGeneClick }) {
  const [filter, setFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [hoveredGene, setHoveredGene] = useState(null);
  const canvasRef = useRef(null);

  const filtered = GENES.filter(g =>
    (filter === "ALL" || g.category === filter) &&
    (typeFilter === "ALL" || g.type === typeFilter)
  );

  // Draw Pareto chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const pad = { top: 30, right: 30, bottom: 50, left: 60 };
    const pw = W - pad.left - pad.right, ph = H - pad.top - pad.bottom;

    ctx.clearRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = "#ffffff0a";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = pad.top + (ph / 5) * i;
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
      ctx.fillStyle = colors.grayDark; ctx.font = "12px Outfit";
      ctx.textAlign = "right"; ctx.fillText((1 - i / 5).toFixed(1), pad.left - 8, y + 4);
    }
    for (let i = 0; i <= 5; i++) {
      const x = pad.left + (pw / 5) * i;
      ctx.beginPath(); ctx.moveTo(x, pad.top); ctx.lineTo(x, H - pad.bottom); ctx.stroke();
      ctx.textAlign = "center"; ctx.fillText((i / 5).toFixed(1), x, H - pad.bottom + 20);
    }

    // Axis labels
    ctx.fillStyle = colors.textMuted; ctx.font = "13px Outfit";
    ctx.textAlign = "center";
    ctx.fillText("Score de Secreção →", W / 2, H - 8);
    ctx.save(); ctx.translate(14, H / 2); ctx.rotate(-Math.PI / 2);
    ctx.fillText("Especificidade de Cepa →", 0, 0); ctx.restore();

    // Points
    filtered.forEach(g => {
      const x = pad.left + g.secretion * pw;
      const y = pad.top + (1 - g.strain_specificity) * ph;
      const r = 5 + g.confidence * 6;
      const isHovered = hoveredGene === g.id;

      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = (CAT_COLORS[g.category] || colors.gray) + (isHovered ? "ff" : "80");
      ctx.fill();
      if (isHovered) {
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });

    // Store positions for hover
    canvas._points = filtered.map(g => ({
      x: pad.left + g.secretion * pw,
      y: pad.top + (1 - g.strain_specificity) * ph,
      r: 5 + g.confidence * 6,
      gene: g,
    }));
  }, [filtered, hoveredGene]);

  const handleCanvasMove = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas._points) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);
    let found = null;
    for (const pt of canvas._points) {
      const dx = mx - pt.x, dy = my - pt.y;
      if (dx * dx + dy * dy < (pt.r + 4) * (pt.r + 4)) { found = pt.gene.id; break; }
    }
    setHoveredGene(found);
  }, []);

  const handleCanvasClick = useCallback(() => {
    if (hoveredGene !== null) {
      const gene = GENES.find(g => g.id === hoveredGene);
      if (gene) onGeneClick(gene);
    }
  }, [hoveredGene, onGeneClick]);

  const hGene = hoveredGene !== null ? GENES.find(g => g.id === hoveredGene) : null;

  return (
    <div style={{ padding: "80px 24px 40px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: 20, marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: colors.white, fontFamily: "'Outfit', sans-serif", margin: 0 }}>
            Dashboard de Resultados
          </h2>
          <p style={{ fontSize: 14, color: colors.textMuted, margin: "4px 0 0" }}>
            Pareto interativo: secreção × especificidade de cepa. Clique em um gene para ver o relatório.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["ALL", "UNIVERSAL", "CEPA-ESPECÍFICO", "HOUSEKEEPING"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
              background: filter === f ? (f === "ALL" ? colors.cyan : CAT_COLORS[f]) + "25" : colors.card2,
              border: `1px solid ${filter === f ? (f === "ALL" ? colors.cyan : CAT_COLORS[f]) : colors.card2}`,
              color: filter === f ? (f === "ALL" ? colors.cyan : CAT_COLORS[f]) : colors.textMuted,
            }}>{f === "ALL" ? "Todos" : f}</button>
          ))}
          <div style={{ width: 1, background: colors.card2, margin: "0 4px" }} />
          {["ALL", "OE", "KO"].map(f => (
            <button key={f} onClick={() => setTypeFilter(f)} style={{
              padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
              background: typeFilter === f ? `${colors.blue}25` : colors.card2,
              border: `1px solid ${typeFilter === f ? colors.blue : colors.card2}`,
              color: typeFilter === f ? colors.blue : colors.textMuted,
            }}>{f === "ALL" ? "OE+KO" : f}</button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        {/* Pareto Chart */}
        <div style={{
          flex: "1 1 600px", background: colors.card, borderRadius: 14, padding: 20,
          border: `1px solid ${colors.card2}`, position: "relative",
        }}>
          <canvas
            ref={canvasRef}
            width={720} height={440}
            style={{ width: "100%", height: "auto", cursor: hoveredGene !== null ? "pointer" : "crosshair" }}
            onMouseMove={handleCanvasMove}
            onMouseLeave={() => setHoveredGene(null)}
            onClick={handleCanvasClick}
          />
          {/* Hover tooltip */}
          {hGene && (
            <div style={{
              position: "absolute", top: 20, right: 20,
              background: colors.card2, borderRadius: 10, padding: 14,
              border: `1px solid ${CAT_COLORS[hGene.category]}40`,
              minWidth: 200, pointerEvents: "none",
            }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: colors.white, fontFamily: "monospace" }}>{hGene.name}</div>
              <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>{hGene.function}</div>
              <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
                <div>
                  <div style={{ fontSize: 10, color: colors.textMuted }}>Secreção</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: colors.cyan }}>{hGene.secretion}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: colors.textMuted }}>Cepa spec.</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: colors.orange }}>{hGene.strain_specificity}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: colors.textMuted }}>Confiança</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: colors.green }}>{hGene.confidence}</div>
                </div>
              </div>
              <span style={{
                display: "inline-block", marginTop: 8, padding: "2px 8px", borderRadius: 6,
                fontSize: 11, fontWeight: 600,
                background: `${CAT_COLORS[hGene.category]}20`,
                color: CAT_COLORS[hGene.category],
              }}>{hGene.category} · {hGene.type}</span>
            </div>
          )}
          {/* Legend */}
          <div style={{ display: "flex", gap: 16, marginTop: 8, justifyContent: "center" }}>
            {Object.entries(CAT_COLORS).map(([k, c]) => (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
                <span style={{ fontSize: 11, color: colors.textMuted }}>{k}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Gene ranking table */}
        <div style={{
          flex: "1 1 300px", maxHeight: 540, overflowY: "auto",
          background: colors.card, borderRadius: 14, padding: 16,
          border: `1px solid ${colors.card2}`,
        }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: colors.white, marginBottom: 12 }}>
            Top Genes ({filtered.length})
          </div>
          {filtered.sort((a, b) => b.secretion - a.secretion).slice(0, 20).map((g, i) => (
            <div key={g.id} onClick={() => onGeneClick(g)}
              style={{
                display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
                borderRadius: 8, cursor: "pointer",
                background: i % 2 === 0 ? "transparent" : `${colors.card2}40`,
                transition: "background 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = `${colors.cyan}10`}
              onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "transparent" : `${colors.card2}40`}
            >
              <div style={{
                width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                background: `${CAT_COLORS[g.category]}18`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, color: CAT_COLORS[g.category],
              }}>{i + 1}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: colors.white, fontFamily: "monospace" }}>{g.name}</div>
                <div style={{ fontSize: 10, color: colors.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.function}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: colors.cyan }}>{g.secretion}</div>
                <span style={{
                  fontSize: 9, fontWeight: 600, padding: "1px 5px", borderRadius: 4,
                  background: g.type === "OE" ? `${colors.green}15` : `${colors.red}15`,
                  color: g.type === "OE" ? colors.green : colors.red,
                }}>{g.type}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReportScreen({ gene, onBack }) {
  const [expanded, setExpanded] = useState(true);

  if (!gene) return null;

  return (
    <div style={{ padding: "80px 40px 40px", maxWidth: 900, margin: "0 auto" }}>
      <button onClick={onBack} style={{
        background: "transparent", border: "none", color: colors.cyan,
        fontSize: 14, cursor: "pointer", marginTop: 20, marginBottom: 20,
        display: "flex", alignItems: "center", gap: 6,
      }}>← Voltar ao Dashboard</button>

      <div style={{
        background: colors.card, borderRadius: 16, padding: 32,
        border: `1px solid ${CAT_COLORS[gene.category]}30`, marginBottom: 20,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <h2 style={{ fontSize: 28, fontWeight: 800, color: colors.white, fontFamily: "'Outfit', monospace", margin: 0 }}>
                {gene.name}
              </h2>
              <span style={{
                padding: "4px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                background: gene.type === "OE" ? `${colors.green}18` : `${colors.red}18`,
                color: gene.type === "OE" ? colors.green : colors.red,
              }}>{gene.type === "OE" ? "Overexpression" : "Knockout"}</span>
              <span style={{
                padding: "4px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                background: `${CAT_COLORS[gene.category]}18`,
                color: CAT_COLORS[gene.category],
              }}>{gene.category}</span>
            </div>
            <p style={{ fontSize: 16, color: colors.textMuted, margin: 0 }}>{gene.function}</p>
          </div>
        </div>

        {/* Scores */}
        <div style={{ display: "flex", gap: 20, marginTop: 24, flexWrap: "wrap" }}>
          {[
            { l: "Score Secreção", v: gene.secretion, c: colors.cyan },
            { l: "Especif. Cepa", v: gene.strain_specificity, c: colors.orange },
            { l: "Confiança Ensemble", v: gene.confidence, c: colors.green },
          ].map((s, i) => (
            <div key={i} style={{
              flex: "1 1 120px", background: colors.card2, borderRadius: 10, padding: 16,
              borderLeft: `3px solid ${s.c}`,
            }}>
              <div style={{ fontSize: 11, color: colors.textMuted, textTransform: "uppercase", letterSpacing: 1 }}>{s.l}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.c, fontFamily: "'Outfit', sans-serif", marginTop: 4 }}>{s.v}</div>
              <div style={{
                height: 4, background: `${s.c}20`, borderRadius: 2, marginTop: 8,
              }}>
                <div style={{ height: "100%", width: `${s.v * 100}%`, background: s.c, borderRadius: 2 }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* LLM Report */}
      <div style={{
        background: colors.card, borderRadius: 16, padding: 32,
        border: `1px solid ${colors.card2}`,
      }}>
        <div onClick={() => setExpanded(!expanded)} style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          cursor: "pointer", marginBottom: expanded ? 20 : 0,
        }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: colors.white, margin: 0, fontFamily: "'Outfit', sans-serif" }}>
            📋 Relatório Interpretativo (LLM)
          </h3>
          <span style={{ color: colors.textMuted, fontSize: 18 }}>{expanded ? "▾" : "▸"}</span>
        </div>

        {expanded && (
          <div style={{ fontSize: 14, color: colors.text, lineHeight: 1.8 }}>
            <p style={{ margin: "0 0 16px" }}>
              <strong style={{ color: colors.cyan }}>Função biológica:</strong> Este gene codifica uma{" "}
              {gene.function.toLowerCase()}. Em K. phaffii, está envolvido diretamente na via secretória,
              com papel documentado na eficiência de processamento e transporte de proteínas heterólogas para o meio extracelular.
            </p>
            <p style={{ margin: "0 0 16px" }}>
              <strong style={{ color: colors.orange }}>Evidência na literatura:</strong>{" "}
              {gene.type === "OE" ? "Overexpression" : "Knockout"} deste gene mostrou efeito positivo na secreção
              em {Math.floor(Math.random() * 4) + 5} de {Math.floor(Math.random() * 3) + 7} estudos analisados.
              O efeito foi observado em condições de indução com metanol (AOX1) e em sistemas constitutivos (GAP).
              {gene.category === "UNIVERSAL"
                ? " O efeito é consistente entre cepas GS115, X-33 e KM71, classificando este alvo como UNIVERSAL."
                : gene.category === "CEPA-ESPECÍFICO"
                  ? ` O efeito é significativamente mais forte na cepa ${gene.strain}, classificando como CEPA-ESPECÍFICO.`
                  : " O efeito é modesto e não específico para secreção, classificando como HOUSEKEEPING."
              }
            </p>
            <p style={{ margin: "0 0 16px" }}>
              <strong style={{ color: colors.green }}>Confiança do ensemble:</strong> Score de {gene.confidence} indica
              concordância {gene.confidence > 0.8 ? "alta" : "moderada"} entre os 6 modelos ML (RF, XGBoost, LightGBM, SVM, MLP, LogReg).
              O Bayesian Model Averaging pondera os modelos pela sua acurácia individual, favorecendo os que melhor
              performaram no cross-validation.
            </p>
            <p style={{ margin: "0 0 16px" }}>
              <strong style={{ color: colors.purple }}>GO Terms relevantes:</strong> secretory pathway (GO:0045073),
              protein transport (GO:0015031), endoplasmic reticulum (GO:0005783).
            </p>
            <div style={{
              background: colors.card2, borderRadius: 10, padding: 16, marginTop: 16,
              borderLeft: `3px solid ${gene.type === "OE" ? colors.green : colors.red}`,
            }}>
              <strong style={{ color: colors.white }}>Recomendação:</strong>{" "}
              <span style={{ color: colors.textMuted }}>
                {gene.type === "OE"
                  ? `Overexpression de ${gene.name} é um alvo prioritário para aumento de secreção.`
                  : `Knockout de ${gene.name} pode remover um bottleneck no pathway secretório.`
                }
                {" "}Recomenda-se validação experimental como parte do próximo ciclo DBTL.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Export */}
      <div style={{ display: "flex", gap: 12, marginTop: 20, justifyContent: "flex-end" }}>
        <button style={{
          padding: "10px 20px", borderRadius: 10, border: `1px solid ${colors.card2}`,
          background: colors.card, color: colors.textMuted, fontSize: 13, cursor: "pointer",
        }}>📄 Exportar PDF</button>
        <button style={{
          padding: "10px 20px", borderRadius: 10, border: `1px solid ${colors.card2}`,
          background: colors.card, color: colors.textMuted, fontSize: 13, cursor: "pointer",
        }}>📊 Exportar CSV</button>
      </div>
    </div>
  );
}

// ── Exploration Mode: Select Organism/Strain ──

const ORGANISMS = [
  {
    id: "kphaffii", name: "K. phaffii", alt: "Pichia pastoris", icon: "🧫",
    desc: "Sistema de expressão heteróloga dominante para proteínas recombinantes industriais.",
    strains: [
      { id: "GS115", samples: 142, datasets: 4, status: "ready" },
      { id: "X-33", samples: 58, datasets: 2, status: "ready" },
      { id: "KM71", samples: 25, datasets: 1, status: "ready" },
    ],
    genes: "5.116", papers: "19-20", tags: ["biofármacos", "enzimas", "recombinantes"],
    color: colors.cyan,
  },
  {
    id: "scerevisiae", name: "S. cerevisiae", alt: "Baker's yeast", icon: "🍺",
    desc: "Organismo modelo eucarioto. Ampla base de dados públicos e ferramentas genéticas.",
    strains: [
      { id: "BY4741", samples: 320, datasets: 8, status: "ready" },
      { id: "W303", samples: 185, datasets: 5, status: "ready" },
      { id: "CEN.PK", samples: 90, datasets: 3, status: "beta" },
    ],
    genes: "6.275", papers: "50+", tags: ["biocombustíveis", "metabólitos", "modelo"],
    color: colors.purple,
  },
  {
    id: "ecoli", name: "E. coli", alt: "Bacterium", icon: "🦠",
    desc: "Bactéria mais utilizada em biotecnologia. Requer validação do pipeline (metabolismo distinto).",
    strains: [
      { id: "BL21(DE3)", samples: 410, datasets: 12, status: "beta" },
      { id: "K-12 MG1655", samples: 280, datasets: 7, status: "beta" },
    ],
    genes: "4.321", papers: "100+", tags: ["pharma", "industrial", "bactéria"],
    color: colors.orange,
  },
];

function ExploreSelectScreen({ onSelect }) {
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [selectedStrain, setSelectedStrain] = useState(null);

  return (
    <div style={{ padding: "80px 40px 40px", maxWidth: 1000, margin: "0 auto" }}>
      <h2 style={{ fontSize: 32, fontWeight: 700, color: colors.white, fontFamily: "'Outfit', sans-serif", margin: "40px 0 8px" }}>
        Modo Exploração
      </h2>
      <p style={{ fontSize: 15, color: colors.textMuted, marginBottom: 36 }}>
        Selecione organismo e cepa. O sistema buscará dados públicos, montará o pipeline e entregará rankings priorizados.
      </p>

      {/* Organism cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
        {ORGANISMS.map(org => {
          const active = selectedOrg?.id === org.id;
          return (
            <div key={org.id} onClick={() => { setSelectedOrg(org); setSelectedStrain(null); }}
              style={{
                background: active ? `${org.color}10` : colors.card,
                borderRadius: 14, padding: 24, cursor: "pointer",
                border: `2px solid ${active ? org.color : colors.card2}`,
                transition: "all 0.25s",
              }}
              onMouseEnter={e => !active && (e.currentTarget.style.borderColor = `${org.color}60`)}
              onMouseLeave={e => !active && (e.currentTarget.style.borderColor = colors.card2)}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <span style={{ fontSize: 28 }}>{org.icon}</span>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: colors.white, fontFamily: "'Outfit', sans-serif" }}>{org.name}</div>
                  <div style={{ fontSize: 12, color: colors.textMuted }}>{org.alt}</div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: colors.textMuted, lineHeight: 1.5, margin: "0 0 16px" }}>{org.desc}</p>
              <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                <div><span style={{ fontSize: 11, color: colors.textMuted }}>Genes: </span><span style={{ fontSize: 13, fontWeight: 600, color: org.color }}>{org.genes}</span></div>
                <div><span style={{ fontSize: 11, color: colors.textMuted }}>Papers: </span><span style={{ fontSize: 13, fontWeight: 600, color: org.color }}>{org.papers}</span></div>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {org.tags.map(tag => (
                  <span key={tag} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 12, background: `${org.color}15`, color: org.color, fontWeight: 500 }}>{tag}</span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Strain selection */}
      {selectedOrg && (
        <div style={{
          background: colors.card, borderRadius: 14, padding: 24, marginBottom: 28,
          border: `1px solid ${selectedOrg.color}30`,
        }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: colors.white, marginBottom: 4 }}>
            Selecione a cepa de {selectedOrg.name}
          </div>
          <div style={{ fontSize: 13, color: colors.textMuted, marginBottom: 20 }}>
            Rankings serão personalizados para a cepa escolhida. Genes classificados como UNIVERSAL vs CEPA-ESPECÍFICO.
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {selectedOrg.strains.map(strain => {
              const active = selectedStrain?.id === strain.id;
              const isBeta = strain.status === "beta";
              return (
                <div key={strain.id} onClick={() => setSelectedStrain(strain)}
                  style={{
                    background: active ? `${selectedOrg.color}18` : colors.card2,
                    borderRadius: 10, padding: "16px 24px", cursor: "pointer",
                    border: `2px solid ${active ? selectedOrg.color : "transparent"}`,
                    transition: "all 0.2s", minWidth: 180,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: colors.white, fontFamily: "monospace" }}>{strain.id}</span>
                    {isBeta && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 8, background: `${colors.orange}20`, color: colors.orange, fontWeight: 600 }}>BETA</span>}
                  </div>
                  <div style={{ fontSize: 12, color: colors.textMuted }}>
                    {strain.samples} amostras · {strain.datasets} datasets
                  </div>
                  {active && <div style={{ marginTop: 8, fontSize: 11, color: selectedOrg.color, fontWeight: 600 }}>✓ Selecionada</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Summary + GO button */}
      {selectedOrg && selectedStrain && (
        <div style={{
          background: `linear-gradient(135deg, ${selectedOrg.color}08, ${colors.card})`,
          borderRadius: 14, padding: 24,
          border: `1px solid ${selectedOrg.color}40`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 16,
        }}>
          <div>
            <div style={{ fontSize: 14, color: colors.textMuted, marginBottom: 4 }}>Análise configurada:</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: colors.white }}>
              {selectedOrg.name} — cepa <span style={{ color: selectedOrg.color }}>{selectedStrain.id}</span>
            </div>
            <div style={{ fontSize: 13, color: colors.textMuted, marginTop: 4 }}>
              {selectedStrain.samples} amostras · {selectedOrg.genes} genes · {selectedStrain.datasets} datasets GEO
            </div>
          </div>
          <button onClick={() => onSelect({ org: selectedOrg, strain: selectedStrain })}
            style={{
              padding: "14px 36px", borderRadius: 12, border: "none", cursor: "pointer",
              background: selectedOrg.color, color: colors.bg, fontSize: 16, fontWeight: 700,
              display: "flex", alignItems: "center", gap: 8,
            }}
          >
            ⚡ Iniciar Exploração
          </button>
        </div>
      )}
    </div>
  );
}

// ── Exploration Mode: Pipeline ──

function ExplorePipelineScreen({ config, onNext }) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [logs, setLogs] = useState([]);

  const orgName = config?.org?.name || "K. phaffii";
  const strainId = config?.strain?.id || "GS115";
  const orgColor = config?.org?.color || colors.cyan;
  const nSamples = config?.strain?.samples || 142;
  const nDatasets = config?.strain?.datasets || 4;
  const nGenes = config?.org?.genes || "5.116";

  const steps = [
    {
      label: "Busca de dados no NCBI GEO",
      desc: `Consultando API Entrez para datasets de ${orgName}...`,
      icon: "🔍", duration: 8, color: colors.blue,
      detail: `${nDatasets} datasets encontrados · ${nSamples} amostras RNA-seq`,
      logs: [
        `[GEO] Querying NCBI GEO: "${orgName}" AND "RNA-seq"`,
        `[GEO] Found ${nDatasets} series: GSE123456, GSE234567...`,
        `[GEO] Downloading series matrix files...`,
        `[GEO] ${nSamples} samples identified across ${nDatasets} datasets`,
      ]
    },
    {
      label: "Extração de metadados",
      desc: "Parseando SRA metadata, identificando cepas e condições...",
      icon: "📋", duration: 7, color: colors.purple,
      detail: `Cepas mapeadas: ${strainId} + variantes · Condições: alta/baixa secreção`,
      logs: [
        `[META] Parsing SRA run table for sample attributes...`,
        `[META] Mapping strain identifiers: ${strainId} detected in ${Math.round(nSamples*0.6)} samples`,
        `[META] Conditions classified: High secretion (${Math.round(nSamples*0.42)}), Low (${Math.round(nSamples*0.58)})`,
        `[META] Cross-referencing strain background: GQ67_* (Y-11430) vs PAS_* (GS115)`,
      ]
    },
    {
      label: "Controle de qualidade",
      desc: "Filtrando amostras de baixa qualidade e outliers...",
      icon: "🧹", duration: 6, color: colors.orange,
      detail: `${Math.round(nSamples*0.92)} amostras passaram QC (${Math.round(nSamples*0.08)} removidas)`,
      logs: [
        `[QC] Computing per-sample statistics (library size, genes detected)...`,
        `[QC] Flagged ${Math.round(nSamples*0.05)} samples: library size < 1M reads`,
        `[QC] Flagged ${Math.round(nSamples*0.03)} samples: outlier by PCA (>3 SD)`,
        `[QC] ${Math.round(nSamples*0.92)} samples passed quality filters`,
      ]
    },
    {
      label: "Normalização: counts → TPM",
      desc: "Convertendo raw counts para TPM usando gene lengths do genoma de referência...",
      icon: "📐", duration: 8, color: colors.cyan,
      detail: `${nGenes} genes quantificados em TPM · Genoma ref: ASM170810v1`,
      logs: [
        `[TPM] Loading gene lengths from ${orgName} reference genome...`,
        `[TPM] Computing reads per kilobase (RPK) for ${nGenes} genes...`,
        `[TPM] Scaling to transcripts per million (TPM)...`,
        `[TPM] Verifying: column sums = 1e6 ✓ for all ${Math.round(nSamples*0.92)} samples`,
      ]
    },
    {
      label: "Mapeamento de cepas vs modificações",
      desc: "Separando efeito de background genômico do efeito de engenharia...",
      icon: "🧬", duration: 7, color: colors.green,
      detail: `Genomas mapeados: Y-11430 (GQ67_*) vs GS115 (PAS_*) vs CBS7435`,
      logs: [
        `[STRAIN] Fetching reference genomes from NCBI...`,
        `[STRAIN] Mapping ${strainId} to reference: Y-11430 / GQ67_* gene IDs`,
        `[STRAIN] Separating strain background from genetic modifications (AOX1, GAP, etc.)`,
        `[STRAIN] Metadata enriched: strain_effect ≠ modification_effect for ${nGenes} genes`,
      ]
    },
    {
      label: "Feature Selection (ANOVA + RF)",
      desc: `Reduzindo ${nGenes} genes para os 500 mais informativos...`,
      icon: "🎯", duration: 10, color: colors.purple,
      detail: `${nGenes} → 500 genes · ANOVA F-test + Random Forest importances`,
      logs: [
        `[FS] Running ANOVA F-test across ${nGenes} genes...`,
        `[FS] Top 1000 by F-score selected (p < 0.001)`,
        `[FS] Training RF for feature importance ranking...`,
        `[FS] Intersection ANOVA ∩ RF: 500 genes retained`,
      ]
    },
    {
      label: "Treinamento: 6 modelos ML + Optuna",
      desc: "Random Forest, XGBoost, LightGBM, SVM, MLP, LogReg...",
      icon: "⚙️", duration: 18, color: colors.cyan,
      detail: "Cada modelo otimizado com 50 trials Optuna · Validação cruzada stratified 5-fold",
      logs: [
        `[ML] Training Random Forest (50 Optuna trials)... Acc: 0.94`,
        `[ML] Training XGBoost (50 trials)... Acc: 0.95`,
        `[ML] Training LightGBM (50 trials)... Acc: 0.93`,
        `[ML] Training SVM-RBF (50 trials)... Acc: 0.91`,
        `[ML] Training MLP (50 trials)... Acc: 0.89`,
        `[ML] Training Logistic Regression... Acc: 0.87`,
      ]
    },
    {
      label: "Ensemble Bayesian Model Averaging",
      desc: "Combinando 6 modelos com pesos Bayesianos...",
      icon: "🧠", duration: 6, color: colors.purple,
      detail: "BMA Bal. Accuracy: 97% · Pesos: XGB 0.28, RF 0.24, LGBM 0.20, ...",
      logs: [
        `[BMA] Computing posterior model probabilities...`,
        `[BMA] Weights: XGBoost=0.28, RF=0.24, LightGBM=0.20, SVM=0.14, MLP=0.09, LogReg=0.05`,
        `[BMA] Ensemble Balanced Accuracy: 0.970`,
        `[BMA] Generating gene-level confidence scores...`,
      ]
    },
    {
      label: "Validação metabólica (GEM/FBA)",
      desc: `Verificando viabilidade de knockouts no modelo metabólico iMT1026v3...`,
      icon: "🔬", duration: 8, color: colors.green,
      detail: "47/50 KOs são metabolicamente viáveis · 3 essenciais removidos",
      logs: [
        `[GEM] Loading genome-scale model: iMT1026v3 (${orgName})`,
        `[GEM] Running FBA for 50 candidate knockouts...`,
        `[GEM] Essential genes detected: 3 (growth rate < 10% of WT)`,
        `[GEM] 47/50 KO candidates validated as metabolically viable ✓`,
      ]
    },
    {
      label: "Otimização Pareto (secreção × cepa)",
      desc: "Calculando fronteira de Pareto multi-objetivo...",
      icon: "📊", duration: 5, color: colors.orange,
      detail: "100 genes priorizados: 50 KO + 50 OE · UNIVERSAL vs CEPA-ESPECÍFICO",
      logs: [
        `[PARETO] Computing secretion scores (BMA ensemble)...`,
        `[PARETO] Computing strain specificity index per gene...`,
        `[PARETO] Classifying: UNIVERSAL (${42} genes), CEPA-ESPECÍFICO (${38}), HOUSEKEEPING (${20})`,
        `[PARETO] Top 100 candidates selected (50 KO + 50 OE)`,
      ]
    },
    {
      label: "Geração de relatórios LLM",
      desc: "Claude API gerando relatórios interpretativos por gene...",
      icon: "📝", duration: 7, color: colors.blue,
      detail: "100 reports gerados · Anotação funcional + evidência + referências",
      logs: [
        `[LLM] Fetching GO annotations and UniProt data for 100 genes...`,
        `[LLM] Generating interpretive report for GQ67_04563 (Chaperona ER)...`,
        `[LLM] Generating reports... 25/100... 50/100... 75/100...`,
        `[LLM] All 100 gene reports generated ✓`,
      ]
    },
  ];

  const totalDuration = steps.reduce((acc, s) => acc + s.duration, 0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) { clearInterval(timer); return 100; }
        return prev + 0.55;
      });
    }, 50);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let acc = 0;
    for (let i = 0; i < steps.length; i++) {
      acc += (steps[i].duration / totalDuration) * 100;
      if (progress < acc) {
        if (i !== currentStep) {
          setCurrentStep(i);
          setLogs(prev => [...prev.slice(-12), ...steps[i].logs]);
        }
        return;
      }
    }
    if (currentStep !== steps.length - 1) {
      setCurrentStep(steps.length - 1);
      setLogs(prev => [...prev.slice(-12), ...steps[steps.length - 1].logs]);
    }
  }, [progress, currentStep]);

  useEffect(() => {
    if (currentStep === 0 && logs.length === 0) {
      setLogs(steps[0].logs);
    }
  }, []);

  const done = progress >= 100;

  return (
    <div style={{ padding: "80px 40px 40px", maxWidth: 900, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "40px 0 8px" }}>
        <span style={{ fontSize: 28 }}>{config?.org?.icon || "🧫"}</span>
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: colors.white, fontFamily: "'Outfit', sans-serif", margin: 0 }}>
            {done ? "Exploração Completa ✓" : `Explorando ${orgName} — ${strainId}`}
          </h2>
          <p style={{ fontSize: 14, color: colors.textMuted, margin: "4px 0 0" }}>
            {done ? "Rankings prontos para exploração." : "Pipeline completo: busca de dados → modelagem → relatórios."}
          </p>
        </div>
      </div>

      {/* Summary badges */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          { l: "Datasets", v: nDatasets, c: colors.blue },
          { l: "Amostras", v: nSamples, c: colors.purple },
          { l: "Genes", v: nGenes, c: orgColor },
          { l: "Cepa", v: strainId, c: colors.green },
        ].map((b, i) => (
          <div key={i} style={{ background: colors.card, borderRadius: 8, padding: "8px 16px", border: `1px solid ${b.c}25` }}>
            <span style={{ fontSize: 11, color: colors.textMuted }}>{b.l}: </span>
            <span style={{ fontSize: 14, fontWeight: 700, color: b.c, fontFamily: "monospace" }}>{b.v}</span>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div style={{ background: colors.card, borderRadius: 12, height: 10, overflow: "hidden", marginBottom: 28 }}>
        <div style={{
          height: "100%", borderRadius: 12, transition: "width 0.3s",
          width: `${Math.min(progress, 100)}%`,
          background: done ? colors.green : `linear-gradient(90deg, ${colors.purple}, ${orgColor})`,
        }} />
      </div>

      <div style={{ display: "flex", gap: 20 }}>
        {/* Steps column */}
        <div style={{ flex: "1 1 55%", display: "flex", flexDirection: "column", gap: 4 }}>
          {steps.map((step, i) => {
            const active = i === currentStep && !done;
            const completed = i < currentStep || done;
            const future = i > currentStep && !done;
            return (
              <div key={i} style={{
                display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 14px",
                borderRadius: 10, background: active ? `${step.color}08` : "transparent",
                border: active ? `1px solid ${step.color}25` : "1px solid transparent",
                opacity: future ? 0.35 : 1, transition: "all 0.4s",
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14,
                  background: completed ? `${colors.green}18` : active ? `${step.color}18` : colors.card2,
                  border: `1.5px solid ${completed ? colors.green : active ? step.color : "transparent"}`,
                }}>
                  {completed ? <span style={{ color: colors.green }}>✓</span> : step.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 14, fontWeight: active ? 600 : 400,
                    color: completed ? colors.green : active ? colors.white : colors.textMuted,
                  }}>{step.label}</div>
                  {(active || completed) && (
                    <div style={{ fontSize: 12, color: completed ? `${colors.green}90` : colors.textMuted, marginTop: 2 }}>
                      {step.detail}
                    </div>
                  )}
                  {active && (
                    <div style={{ marginTop: 6, height: 3, background: colors.card2, borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ width: "60%", height: "100%", background: step.color, borderRadius: 2, animation: "pulse 1.5s ease-in-out infinite" }} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Terminal / Logs */}
        <div style={{
          flex: "1 1 45%", background: "#0a0c12", borderRadius: 12, padding: 16,
          border: `1px solid ${colors.card2}`, fontFamily: "monospace", fontSize: 12,
          overflow: "auto", maxHeight: 520,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: done ? colors.green : colors.red }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: colors.orange }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: colors.green }} />
            <span style={{ marginLeft: 8, fontSize: 11, color: colors.textMuted }}>arkbioai-pipeline.log</span>
          </div>
          {logs.map((log, i) => (
            <div key={i} style={{
              color: log.includes("✓") || log.includes("Acc:") ? colors.green
                   : log.includes("Flagged") || log.includes("Essential") ? colors.orange
                   : colors.textMuted,
              lineHeight: 1.7, fontSize: 11.5,
              opacity: i >= logs.length - 4 ? 1 : 0.5,
            }}>
              <span style={{ color: colors.grayDark }}>{'>'} </span>{log}
            </div>
          ))}
          {!done && <span style={{ color: orgColor, animation: "blink 1s step-end infinite" }}>▊</span>}
        </div>
      </div>

      {done && (
        <button onClick={onNext} style={{
          marginTop: 28, padding: "14px 32px", borderRadius: 12, border: "none",
          background: colors.green, color: colors.bg, fontSize: 16,
          cursor: "pointer", fontWeight: 700, width: "100%",
        }}>Ver Resultados →</button>
      )}

      <style>{`
        @keyframes pulse { 0%,100% { opacity: 0.4; } 50% { opacity: 1; } }
        @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
      `}</style>
    </div>
  );
}

// ── Main App ──
export default function ArkBioAIDemo() {
  const [screen, setScreen] = useState("home");
  const [selectedGene, setSelectedGene] = useState(null);
  const [exploreConfig, setExploreConfig] = useState(null);

  const handleGeneClick = (gene) => {
    setSelectedGene(gene);
    setScreen("report");
  };

  const handleExploreSelect = (config) => {
    setExploreConfig(config);
    setScreen("explore_pipeline");
  };

  const isExploreFlow = screen === "explore_select" || screen === "explore_pipeline";

  const navSteps = isExploreFlow || exploreConfig ? [
    { id: "home", label: "Início", icon: "◈" },
    { id: "explore_select", label: "Organismo", icon: "🧫" },
    { id: "explore_pipeline", label: "Pipeline", icon: "⚡" },
    { id: "dashboard", label: "Dashboard", icon: "◫" },
    { id: "report", label: "Report", icon: "📋" },
  ] : [
    { id: "home", label: "Início", icon: "◈" },
    { id: "upload", label: "Upload", icon: "↑" },
    { id: "pipeline", label: "Pipeline", icon: "⚡" },
    { id: "dashboard", label: "Dashboard", icon: "◫" },
    { id: "report", label: "Report", icon: "📋" },
  ];

  return (
    <div style={{
      minHeight: "100vh", background: colors.bg, color: colors.text,
      fontFamily: "'Outfit', 'Segoe UI', sans-serif",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      <NavBar currentStep={screen} onNavigate={setScreen} steps={navSteps} />

      {screen === "home" && (
        <HomeScreen
          onStart={() => setScreen("upload")}
          onExplore={() => { setExploreConfig(null); setScreen("explore_select"); }}
        />
      )}
      {screen === "upload" && <UploadScreen onNext={() => setScreen("pipeline")} />}
      {screen === "pipeline" && <PipelineScreen onNext={() => setScreen("dashboard")} />}
      {screen === "explore_select" && <ExploreSelectScreen onSelect={handleExploreSelect} />}
      {screen === "explore_pipeline" && <ExplorePipelineScreen config={exploreConfig} onNext={() => setScreen("dashboard")} />}
      {screen === "dashboard" && <DashboardScreen onGeneClick={handleGeneClick} />}
      {screen === "report" && <ReportScreen gene={selectedGene} onBack={() => setScreen("dashboard")} />}
    </div>
  );
}
