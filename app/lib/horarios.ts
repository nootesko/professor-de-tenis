export const AULA_MIN = 45;

export type Slot = { inicio: string; fim: string; label: string };

function fmt(min: number) {
  return `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
}

export const HORARIOS: Slot[] = (() => {
  const slots: Slot[] = [];
  for (let h = 7; h <= 21; h++) {
    const inicio = fmt(h * 60);
    const fim = fmt(h * 60 + AULA_MIN);
    slots.push({ inicio, fim, label: `${inicio} às ${fim}` });
  }
  return slots;
})();

export function slotFromHorario(horario: string): Slot {
  const inicio = horario.split("-")[0]?.trim() ?? HORARIOS[1].inicio;
  return HORARIOS.find((s) => s.inicio === inicio) ?? HORARIOS[1];
}
