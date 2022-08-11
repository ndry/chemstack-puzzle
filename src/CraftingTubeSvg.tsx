import { Reaction, SubstanceId } from "./crafting";
import { substanceColors } from "./substanceColors";
import { JSX } from "preact";
import { css, cx, keyframes } from "@emotion/css";
import { ReactComponent as CraftingTubeSvgRaw } from "./craftingTube.svg";
import { StateTransition } from "./StateTransition";


const slotIndices = [0, 1, 2, 3, 4];

const textCss = slotIndices.map(i => css`
    & #prev_slot${i}_number, 
    & #slot${i}_number {
        font-family: 'Bahnschrift', sans-serif;
        text-anchor: middle;
    }
`);

const transparentTopCompansationCss = css`& { margin-top: -136px; }`;

// the following style is generated by the script ran in console on live app
// [0, 1, 2, 3, 4].map(i => {
//     const [x, y] = getOriginCoords(document.getElementById(`slot${i}_content_`), [0.5, 1]);
//     return `& #prev_slot${i}_content_, & #slot${i}_content_ { transform-origin: ${x}px ${y}px; }`;
// }).join("\n")
const slotTransformOriginsCss = css`
    & #prev_slot0_content_, & #slot0_content_ { transform-origin: 56.70000076293945px 731.0499877929688px; }
    & #prev_slot1_content_, & #slot1_content_ { transform-origin: 56.65000534057617px 599.75px; }
    & #prev_slot2_content_, & #slot2_content_ { transform-origin: 56.70000076293945px 468.45001220703125px; }
    & #prev_slot3_content_, & #slot3_content_ { transform-origin: 56.65000534057617px 337.3500061035156px; }
    & #prev_slot4_content_, & #slot4_content_ { transform-origin: 56.70000076293945px 206.0500030517578px; }
`;

function pourDownAnimationCss({ i, now, start, duration }: {
    i: number,
    now: number,
    start: number,
    duration: number,
}) {
    return css`
        & #slot${i}_content {
            animation: ${keyframes`
                0% { transform: translate(0, -400px); }
                50% { transform: translate(0, 10px); }
                100% { transform: translate(0, 0); }

                0% { opacity: 0; }
                15%, 100% { opacity: 1; }
            `} ${duration}ms ${start - now}ms linear both;
        }
        & #slot${i}_content_ {
            animation: ${keyframes`
                0% { transform: scale(1, 1); }
                50% { transform: scale(1, 1); }
                60% { transform: scale(1.1, 0.8); }
                78% { transform: scale(0.8, 1.3); }
                100% { transform: scale(1, 1); }
            `} ${duration}ms ${start - now}ms linear both;
        }
    `;
}

function pourUpAnimationCss({ i, now, start, duration }: {
    i: number,
    now: number,
    start: number,
    duration: number,
}) {
    return css`
        & #prev_slot${i}_content {
            animation: ${keyframes`
                0% { transform: translate(0, 0); }
                100% { transform: translate(0, -400px); }

                0%, 85% { opacity: 1; }
                100% { opacity: 0; }
            `} ${duration}ms ${start - now}ms linear both;
        }
        & #prev_slot${i}_content_ {
            animation: ${keyframes`
                0% { transform: scale(1, 1); }
                20% { transform: scale(0.9, 1.05); }
                100% { transform: scale(0.7, 1.2); }
            `} ${duration}ms ${start - now}ms linear both;
        }
    `;
}
function cleanUpAnimationCss ({ i, now, start, duration }: {
    i: number,
    now: number,
    start: number,
    duration: number,
}){
    return css`
    & #prev_slot${i}_content_ {
        animation: ${keyframes`
            0% { transform: scale(1, 1); }
            40% { transform: scale(2, 0.3); }
            100% { transform: scale(3, 0.1); opacity: 0;}
        `} ${duration}ms ${start - now}ms linear both;
    }
`;
}


function reactAnimationCss({
    prevTube,
    tube,
    reaction, 
    now, start, duration
}: {
    prevTube: SubstanceId[],
    tube: SubstanceId[],
    reaction: Reaction,
    now: number,
    start: number,
    duration: number,
}) {
    let s = "";
    s += reaction.reagents.map((_, i, arr) => `
        & #prev_slot${prevTube.length - arr.length + i}_content {
            display: unset;
        }
        & #prev_slot${prevTube.length - arr.length + i}_content_ {
            animation: ${keyframes`
                0% { transform: scale(1); }
                50%, 100% { transform: scale(0); }
            `} ${duration}ms ${start - now}ms linear both;
        }`).join("\n");
    s += reaction.products.map((_, i, arr) => `
        & #slot${tube.length - arr.length + i}_content_ {
            animation: ${keyframes`
                0%, 50% { transform: scale(0); }
                100% { transform: scale(1); }
            `} ${duration}ms ${start - now}ms linear both;
        }`).join("\n");
    return css`${s}`;
}


export function CraftingTubeSvg({
    tubeTransition: {
        prevState: prevTube,
        state: tube,
        desc,
        duration,
        start,
    }, now, ...props
}: {
    tubeTransition: StateTransition<
        SubstanceId[],
        { id: "idle" | "prev" | "pourDown" | "pourUp" | "clean" }
        | { id: "react", reaction: Reaction }
    >;
    now: number;
    className?: string;
    style?: JSX.CSSProperties;
}) {

    const tubeContentCss = slotIndices.map(i => {
        const isNext = tube.length === i;
        const hasContent = tube.length > i;
        const prevHasContent = prevTube.length > i;
        const prevColor = substanceColors[prevTube[i]];
        const color = substanceColors[tube[i]];
        return css`
            & #prev_slot${i}_content {
                display: ${prevHasContent ? "unset" : "none"};
            }
            & #prev_slot${i}_content_back {
                fill: ${prevColor};
            }
            & #slot${i}_content {
                display: ${hasContent ? "unset" : "none"};
            }
            & #slot${i}_content_back {
                fill: ${color};
            }
            & #slot${i}_add {
                display: ${isNext ? "unset" : "none"};
            }
        `;
    });
    const tubeContentSlots = Object.fromEntries(slotIndices.flatMap(i => [
        [`prev_slot${i}_number`, prevTube[i]],
        [`slot${i}_number`, tube[i]],
    ]));

    return <CraftingTubeSvgRaw
        {...props}
        className={cx(
            slotTransformOriginsCss,
            textCss,
            transparentTopCompansationCss,
            tubeContentCss,
            "idle" === desc.id && css``,
            "prev" === desc.id && slotIndices.map(i => css`
                & #prev_slot${i}_content {
                    ${prevTube.length <= i ? '' : 'display: unset;'}
                }
                & #slot${i}_content {
                    display: none;
                }
            `),
            "pourDown" === desc.id && pourDownAnimationCss({ 
                i: tube.length - 1, 
                duration, start, now }),
            "pourUp" === desc.id && pourUpAnimationCss({
                i: prevTube.length - 1,
                duration, start, now }),
            "clean" === desc.id && cleanUpAnimationCss({
                i: prevTube.length - 1,
                duration, start, now }),
            "react" === desc.id && reactAnimationCss({ 
                tube,
                prevTube,
                reaction: desc.reaction,
                duration, start, now }),
            css`& {
                
            }`,
            props.className)}
        slots={{
            ...tubeContentSlots,
        }} />;
}
