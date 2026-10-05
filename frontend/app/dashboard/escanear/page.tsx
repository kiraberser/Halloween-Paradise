"use client";

import { useCallback, useState } from "react";
import { Scanner, type IDetectedBarcode, type IScannerError } from "@yudiel/react-qr-scanner";
import { AlertTriangle, CheckCircle2, Clock3, Keyboard, LogIn, RotateCcw, ScanLine, Undo2, XCircle } from "lucide-react";
import { api, apiError } from "@/lib/api";
import { mediaUrl, money } from "@/lib/event";

type Entrada = {
  id: number;
  folio: string;
  nombre: string;
  email: string | null;
  telefono: string | null;
  foto_perfil: string | null;
  genero_display: string;
  tipo_nombre: string;
  modalidad: string;
  precio: string;
  estado: "pagado" | "pendiente" | "cancelado";
  estado_display: string;
  ingreso: string | null;
  ingreso_por_nombre: string | null;
};

type Estado =
  | { fase: "escaneando" }
  | { fase: "buscando" }
  | { fase: "resultado"; entrada: Entrada; recienMarcada?: boolean }
  | { fase: "error"; mensaje: string };

const hora = (iso: string) => new Date(iso).toLocaleTimeString("es-MX", { hour: "numeric", minute: "2-digit" });

export default function EscanearPage() {
  const [estado, setEstado] = useState<Estado>({ fase: "escaneando" });
  const [manual, setManual] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [errorCamara, setErrorCamara] = useState("");

  const buscar = useCallback(async (codigo: string) => {
    setEstado({ fase: "buscando" });
    navigator.vibrate?.(80);
    try {
      const { data } = await api.get<Entrada>("/sales/lookup/", { params: { codigo } });
      setEstado({ fase: "resultado", entrada: data });
    } catch (e) {
      setEstado({ fase: "error", mensaje: apiError(e) });
    }
  }, []);

  const onScan = useCallback(
    (codes: IDetectedBarcode[]) => {
      const valor = codes[0]?.rawValue;
      if (valor && estado.fase === "escaneando") buscar(valor);
    },
    [buscar, estado.fase],
  );

  const onError = useCallback((e: IScannerError) => {
    const mensajes: Partial<Record<IScannerError["kind"], string>> = {
      "permission-denied": "Permite el acceso a la cámara en tu navegador para escanear.",
      "no-camera": "No se encontró ninguna cámara en este dispositivo.",
      "in-use": "La cámara está siendo usada por otra app. Ciérrala y reintenta.",
      "insecure-context": "La cámara solo funciona con https:// (o en localhost).",
    };
    setErrorCamara(mensajes[e.kind] ?? `No se pudo abrir la cámara: ${e.message}`);
  }, []);

  const marcar = async (entrada: Entrada, cobrar = false) => {
    setEnviando(true);
    try {
      const { data } = await api.post<Entrada>(`/sales/${entrada.id}/checkin/`, { cobrar });
      navigator.vibrate?.([60, 40, 60]);
      setEstado({ fase: "resultado", entrada: data, recienMarcada: true });
    } catch (e) {
      setEstado({ fase: "error", mensaje: apiError(e) });
    } finally {
      setEnviando(false);
    }
  };

  const deshacer = async (entrada: Entrada) => {
    if (!confirm(`¿Deshacer la entrada de ${entrada.nombre}?`)) return;
    setEnviando(true);
    try {
      const { data } = await api.delete<Entrada>(`/sales/${entrada.id}/checkin/`);
      setEstado({ fase: "resultado", entrada: data });
    } catch (e) {
      setEstado({ fase: "error", mensaje: apiError(e) });
    } finally {
      setEnviando(false);
    }
  };

  const siguiente = () => {
    setManual("");
    setEstado({ fase: "escaneando" });
  };

  return (
    <div className="mx-auto max-w-md space-y-5">
      <header>
        <h1 className="font-display text-4xl">Escanear QR</h1>
        <p className="text-sm text-white/60">Apunta la cámara al QR del boleto. También puedes escribir el folio.</p>
      </header>

      {/* Cámara */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black">
        {errorCamara ? (
          <div className="grid aspect-square place-items-center p-6 text-center text-sm text-white/70">
            <div>
              <AlertTriangle className="mx-auto mb-2 text-pumpkin" />
              {errorCamara}
              <button onClick={() => setErrorCamara("")} className="btn-ghost mx-auto mt-4 !flex w-fit !py-1.5 text-sm">
                <RotateCcw size={14} /> Reintentar
              </button>
            </div>
          </div>
        ) : (
          <Scanner
            onScan={onScan}
            onError={onError}
            paused={estado.fase !== "escaneando"}
            formats={["qr_code"]}
            constraints={{ facingMode: "environment" }}
            components={{ finder: true, torch: true }}
            sound={false}
            styles={{ container: { aspectRatio: "1 / 1" } }}
          />
        )}
        {estado.fase === "buscando" && (
          <div className="absolute inset-0 grid place-items-center bg-black/60 text-sm text-white/80">Buscando boleto…</div>
        )}
      </div>

      {/* Folio manual */}
      {estado.fase === "escaneando" && (
        <form
          onSubmit={(e) => { e.preventDefault(); if (manual.trim()) buscar(manual.trim()); }}
          className="flex gap-2"
        >
          <label className="relative flex-1">
            <Keyboard size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              placeholder="HP-XXXXXXXX"
              autoCapitalize="characters"
              className="field !pl-9 font-mono uppercase"
            />
          </label>
          <button className="btn-primary !px-4 !py-2.5">Buscar</button>
        </form>
      )}

      {estado.fase === "error" && (
        <div className="rise space-y-4 rounded-2xl border border-red-400/50 bg-red-500/10 p-5 text-center">
          <XCircle className="mx-auto text-red-400" size={40} />
          <p className="font-semibold text-red-200">{estado.mensaje}</p>
          <button onClick={siguiente} className="btn-primary w-full"><ScanLine size={18} /> Escanear otro</button>
        </div>
      )}

      {estado.fase === "resultado" && (
        <Resultado
          entrada={estado.entrada}
          recienMarcada={!!estado.recienMarcada}
          enviando={enviando}
          onMarcar={marcar}
          onDeshacer={deshacer}
          onSiguiente={siguiente}
        />
      )}
    </div>
  );
}

function Resultado({
  entrada, recienMarcada, enviando, onMarcar, onDeshacer, onSiguiente,
}: {
  entrada: Entrada;
  recienMarcada: boolean;
  enviando: boolean;
  onMarcar: (e: Entrada, cobrar?: boolean) => void;
  onDeshacer: (e: Entrada) => void;
  onSiguiente: () => void;
}) {
  const foto = mediaUrl(entrada.foto_perfil);
  const gratis = Number(entrada.precio) === 0;

  // Semáforo de la entrada.
  const aviso = recienMarcada
    ? { tono: "ok", icono: CheckCircle2, texto: `Entrada registrada · ${hora(entrada.ingreso!)}` }
    : entrada.ingreso
      ? { tono: "mal", icono: AlertTriangle, texto: `YA ENTRÓ a las ${hora(entrada.ingreso)}${entrada.ingreso_por_nombre ? ` · ${entrada.ingreso_por_nombre}` : ""}` }
      : entrada.estado === "cancelado"
        ? { tono: "mal", icono: XCircle, texto: "Boleto cancelado" }
        : entrada.estado === "pendiente"
          ? { tono: "pend", icono: Clock3, texto: "Pendiente de pago" }
          : { tono: "ok", icono: CheckCircle2, texto: "Boleto válido" };

  const estilos = {
    ok: "border-green-400/60 bg-green-500/15 text-green-200",
    mal: "border-red-400/60 bg-red-500/15 text-red-200",
    pend: "border-pumpkin/60 bg-pumpkin/15 text-pumpkin-soft",
  }[aviso.tono];
  const Icono = aviso.icono;

  return (
    <div className="rise space-y-4 rounded-2xl border border-white/10 bg-night-2 p-5">
      <p className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-center font-bold ${estilos}`}>
        <Icono size={20} className="shrink-0" /> {aviso.texto}
      </p>

      <div className="flex items-center gap-4">
        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-2 border-pumpkin bg-night">
          {foto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={foto} alt={`Foto de ${entrada.nombre}`} className="h-full w-full object-cover" />
          ) : (
            <span className="grid h-full w-full place-items-center text-3xl font-bold text-witch-glow">{entrada.nombre[0]}</span>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-xl font-bold leading-tight">{entrada.nombre}</p>
          {entrada.email && <p className="truncate text-sm text-white/60">{entrada.email}</p>}
          {entrada.telefono && <p className="text-sm text-white/60">{entrada.telefono}</p>}
          <p className="mt-1 font-mono text-sm text-witch-glow">{entrada.folio}</p>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-3 rounded-xl bg-white/5 p-3 text-sm">
        <div className="col-span-2">
          <dt className="text-[11px] uppercase tracking-wider text-white/45">Boleto</dt>
          <dd className="font-semibold">{entrada.tipo_nombre}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wider text-white/45">Precio</dt>
          <dd className="font-semibold">{gratis ? "Gratis" : money(entrada.precio)}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wider text-white/45">Género</dt>
          <dd className="font-semibold">{entrada.genero_display}</dd>
        </div>
      </dl>

      {!entrada.ingreso && entrada.estado === "pagado" && (
        <button onClick={() => onMarcar(entrada)} disabled={enviando} className="btn-primary w-full !py-4 text-lg">
          <LogIn size={22} /> {enviando ? "Registrando…" : "Marcar entrada"}
        </button>
      )}
      {!entrada.ingreso && entrada.estado === "pendiente" && (
        <button onClick={() => onMarcar(entrada, true)} disabled={enviando} className="btn-primary w-full !py-4 text-lg">
          <LogIn size={22} /> {enviando ? "Registrando…" : gratis ? "Confirmar y marcar entrada" : `Cobrar ${money(entrada.precio)} y marcar entrada`}
        </button>
      )}

      <button onClick={onSiguiente} className={`${entrada.ingreso || entrada.estado === "cancelado" ? "btn-primary" : "btn-ghost"} w-full`}>
        <ScanLine size={18} /> Escanear siguiente
      </button>

      {entrada.ingreso && (
        <button onClick={() => onDeshacer(entrada)} disabled={enviando} className="mx-auto flex items-center gap-1.5 text-xs text-white/50 hover:text-bone">
          <Undo2 size={13} /> Deshacer entrada
        </button>
      )}
    </div>
  );
}
