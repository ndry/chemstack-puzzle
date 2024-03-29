import { css, cx } from "@emotion/css";
import { SubstanceId } from "./puzzle/state";
import { substanceColors } from "./substanceColors";
import { buttonCss } from "./buttonCss";
import { useCraftingAct, useCraftingTransition } from "./solutionRecoil";
import { isSolved } from "./puzzle/actions";

export function CraftingIngredientButton({ sid, mirrored = false }: {
    sid: SubstanceId;
    mirrored?: boolean;
}) {
    const act = useCraftingAct();
    const isWin = isSolved(useCraftingTransition().state);

    function IngredintButtonWave() {
        return <svg id="Layer_2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 54.87 96">
            <g id="Layer_6">
                <path class="cls-1" d="M54.87,9.76c0-2.68-.54-6.29-3.14-8.28-2.04-1.56-5.11-1.9-8.64-.95-2.94,.79-7.55,2.83-12.76,8.08-5.7,5.74-11.06,9.22-16.38,10.65C8.11,20.81,3.46,19.58,0,17.72v16.51h0v48.63c0,7.25,5.88,13.13,13.13,13.13h28.6c7.25,0,13.13-5.88,13.13-13.13V34.24h0V9.76Z" />
            </g>
        </svg>;
    }

    return <button
        className={buttonCss}
        disabled={isWin}
        onClick={() => act({ action: "addIngredient", args: [sid] })}
        style={{
            margin: 5,
            transformOrigin: "50% 70%",
            transform: `rotate(${(mirrored ? -1 : 1) * 15}deg)`,
            borderRadius: "0px 0px 10px 10px",
            position: "relative",
        }}
    >
        <div className={css`
            & {
                width: 29px;
                transform: scale(${(mirrored ? -1 : 1)}, 1) translate(0, 2px);
                position: absolute;
                z-index: -1;
            }
            & .cls-1 {
                fill: ${substanceColors[sid]}
            }
        `}>
            <div className={cx(css`& { transform: translate3d(0, 0, 0) }`)}>
                <IngredintButtonWave />
            </div>
        </div>
        <div style={{
            color: "#ffffffff",
            width: "29px",
            height: "53px",
            fontSize: "35px",
            lineHeight: "68px",
        }}>{sid}</div>
    </button>;
}
