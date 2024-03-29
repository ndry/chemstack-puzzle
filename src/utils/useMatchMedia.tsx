import { useState, useEffect } from 'preact/hooks';
import { Inputs } from "preact/hooks";


export function useMatchMedia(query: string, inputs?: Inputs) {
    const [matches, setMatches] = useState<boolean>();
    useEffect(() => {
        const upd = (ev: { matches: boolean; }) => setMatches(ev.matches);
        const q = window.matchMedia(query);
        q.addEventListener("change", upd);
        upd(q);
        return () => q.removeEventListener("change", upd);
    }, inputs);
    return matches;
}
