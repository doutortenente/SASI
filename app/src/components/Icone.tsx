import { ICONES, type NomeIcone } from "./icones";

/** Ícone do design (Lucide, traço de 2 px), sempre na cor do texto. */
export function Icone({ n, className }: { n: NomeIcone; className?: string }) {
  return <svg className={"ds-icone" + (className ? " " + className : "")} viewBox="0 0 24 24" aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONES[n] }} />;
}
