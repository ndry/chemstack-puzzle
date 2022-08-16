import { atom, selector } from "recoil";
import { CraftingAction, craftingReduce, CraftingState, SubstanceId } from "./crafting";
import { craftingTargetsRecoil } from "./CraftingTargets";
import { reactionsLibraryRecoil } from "./ReactionsLibrary";
import { useUpdRecoilState } from "./utils/useUpdRecoilState";
import { useRecoilValue } from "recoil";
import { useEffect, useState } from "preact/hooks";
import { CompositeKeyWeekMap } from "./utils/CompositeKeyWeekMap";

export const craftingActionsRecoil = atom({
    key: "craftingActions",
    default: [] as CraftingAction[],
});

export const useCraftingAct = () => {
    const upd = useUpdRecoilState(craftingActionsRecoil);
    return (action: CraftingAction) => upd({ $push: [action] });
}

type CraftingStateInTime =
    ReturnType<typeof craftingReduce>
    | { state: Parameters<typeof craftingReduce>[2]; };

const craftingStateInTimeCache = new CompositeKeyWeekMap<CraftingState>();
export const craftingStateInTimeRecoil = selector({
    key: "appliedCraftingActions",
    get: ({ get }) => {
        const cache = craftingStateInTimeCache;

        const actions = get(craftingActionsRecoil);
        const reactions = get(reactionsLibraryRecoil);
        const targets = get(craftingTargetsRecoil);

        const prevAction = actions[actions.length - 2];
        const action = actions[actions.length - 1];

        const cachedState = prevAction && cache.get([prevAction, targets, reactions]);
        const s =
            (cachedState && craftingReduce({ reactions }, action, cachedState))
            ?? actions.reduce(
                (prev, action) => craftingReduce({ reactions }, action, prev.state),
                { state: { tubes: [[]], targets } } as CraftingStateInTime);
        action && cache.set([action, targets, reactions], s.state);
        return s;
    }
});

export const getCraftingState = (stateInTime: CraftingStateInTime, time: number = Infinity) => {
    if (!("prevState" in stateInTime)) {
        return {
            id: "craftingIdle" as const,
            prevState: stateInTime.state,
            state: stateInTime.state,
            diff: {},
            start: 0,
            duration: 0,
        }
    }
    let t = stateInTime.action.time;
    for (const s of stateInTime.children) {
        t += s.duration;
        if (time < t) {
            return {
                ...s,
                start: t - s.duration,
            };
        }
    }
    return {
        id: "craftingIdle" as const,
        prevState: stateInTime.state,
        state: stateInTime.state,
        diff: {},
        start: t,
        duration: 0,
    }
}

export function useCraftingState() {
    const craftingStateInTime = useRecoilValue(craftingStateInTimeRecoil);

    const [time, setTime] = useState(0);
    useEffect(() => {
        const timeLocal = performance.now();
        setTime(performance.now());
        if (!("children" in craftingStateInTime)) { return; }
        const handles = [] as ReturnType<typeof setTimeout>[];
        let t = craftingStateInTime.action.time;
        for (const s of craftingStateInTime.children) {
            t += s.duration;
            if (timeLocal < t) {
                const h = setTimeout(
                    () => setTime(performance.now()),
                    t - timeLocal + 10);
                handles.push(h);
            }
        }
        return () => handles.map(clearTimeout);
    }, [craftingStateInTime]);

    return {
        ...craftingStateInTime,
        currentState: getCraftingState(craftingStateInTime, time),
        currentTime: time,
    };
}