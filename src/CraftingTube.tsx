import { Reaction, SubstanceId } from "./crafting";
import { JSX } from "preact";
import { css, cx, keyframes } from "@emotion/css";
import { useCraftingState } from "./craftingActionsRecoil";
import { PourFromMainIntoSecondaryButton } from "./PourFromMainIntoSecondaryButton";
import { TubeSvg } from "./TubeSvg";


export function CraftingTube({ style }: {
    style?: JSX.CSSProperties;
}) {
    const craftingStateInTime = useCraftingState();
    const time = craftingStateInTime.currentTime;
    const craftingState = craftingStateInTime.currentState;

    const tube = craftingState.state.tubes[0];
    const prevTube = craftingState.prevState.tubes[0];
    const isSecondaryAvailable = craftingState.state.tubes.length > 1;

    const reaction =
        craftingState.id === "craftingReact"
        && craftingState.diffCustom.find(d => d[0] === 0)?.[1];

    return <div className={cx(css`& {
        width: 57px;
        position: relative;
    }`)} style={style}>
        <TubeSvg
            className={cx(
                craftingState.id === "craftingAct"
                && craftingState.diffCustom.action === "addTube"
                && css`
                    & {
                        transform-origin: bottom;
                        animation: ${keyframes`
                            0% { transform: scale(0); }
                            100% { transform: scale(1); }
                        `} ${craftingState.duration}ms ${craftingState.start - time}ms both linear;
                    }
                `,
                craftingState.id === 'craftingAct'
                && craftingState.diffCustom.action === 'trashTube'
                && css`
                    & {
                        transform-origin: bottom;
                        animation: ${keyframes`
                            0% { transform: scale(1); }
                            100% { transform: scale(0); }
                        `} ${craftingState.duration}ms ${craftingState.start - time}ms both linear;
                        } 
                    `,
            )}
            tubeTransition={{
                prevState: craftingState.prevState.tubes[0],
                state: craftingState.state.tubes[0],
                start: craftingState.start,
                duration: craftingState.duration,
                desc: (() => {
                    if (craftingState.id === "craftingAct") {
                        switch (craftingState.diffCustom.action) {
                            case "addIngredient": return { id: "pourDown" };
                            case "addTube": return { id: "idle" };
                            case "trashTube": return { id: "prev" };
                            case "pourFromMainIntoSecondary": return { id: "pourUp" };
                            case "pourFromSecondaryIntoMain": return { id: "pourDown" };
                        }
                    }
                    if (craftingState.id === "craftingReact" && reaction) {
                        return { id: "react", reaction };
                    }
                    if (craftingState.id === "craftingCleanup") {
                        return { id: "clean" };
                    }
                    return { id: "idle" };
                })(),
            }}
            now={time}
        />
        {isSecondaryAvailable && tube.length > 0 && <PourFromMainIntoSecondaryButton
            style={{
                position: "absolute",
                left: "-10px",
                top: ["64%", "42%", "19%"][tube.length - 1],
            }}
        />}
    </div>;
}
