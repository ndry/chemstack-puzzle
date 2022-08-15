import { Reaction, SubstanceId } from "./crafting";
import { hexColorToRgb, rgbToHsl, substanceColors } from "./substanceColors";
import { JSX } from "preact";
import { css, cx, keyframes } from "@emotion/css";
import { ReactComponent as TubeSvgRaw } from "./tube.svg";
import { StateTransition } from "./StateTransition";

const secondaryColor = (hexColor: string) => {
    const { h, s, l } = rgbToHsl(hexColorToRgb(hexColor));
    return `hsl(${((h - 20) + 360) % 360}, ${s * 0.85}%, ${l * 0.85}%)`;
}

const slotIndices = [0, 1, 2, 3, 4];

// the following bBoxes are generated by the script ran in console on live app
// [0, 1, 2, 3, 4].map(i => {
//     const id = `slot${i}_content_`;
//     const rect = document.getElementById(id).getBBox();
//     return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
// })
const bBoxes = [
    { x: 72.625, y: 888.942, width: 62.346, height: 113.645 },
    { x: 72.625, y: 763.060, width: 62.195, height: 113.710 },
    { x: 72.625, y: 637.174, width: 62.195, height: 113.645 },
    { x: 72.625, y: 511.301, width: 62.195, height: 113.645 },
    { x: 72.625, y: 385.427, width: 62.195, height: 113.645 },
];

const slotTransformOriginsCss = slotIndices.map(i => {
    const p = getBBoxCoords(bBoxes[i], [0.5, 1]);
    return css`& #prev_slot${i}_content_, & #slot${i}_content_ { 
        transform-origin: ${p[0]}px ${p[1]}px;
    }`;
});

const textCss = slotIndices.map(i => css`
    & #prev_slot${i}_number, 
    & #slot${i}_number {
        font-family: 'Bahnschrift', sans-serif;
        text-anchor: middle;
        dominant-baseline: central;
        font-size: 76px;
        fill: white;
    }
`);

function SlotGradients({ svgIdPrefix, i, prev }: {
    svgIdPrefix: string, i: number, prev?: boolean
}) {
    const _prev = prev ? "prev_" : "";
    return <>
        <linearGradient
            id={`_${svgIdPrefix}${_prev}_slot${i}_content_back_gradient`}
            href={`#slot${i}_content_back_gradient`}
        >
            <stop offset="0" stop-color="#ff4b33" />
            <stop offset="1" stop-color="#ffab03" />
        </linearGradient>
        <radialGradient
            id={`_${svgIdPrefix}${_prev}_slot${i}_content_back1_gradient`}
            href={`#slot${i}_content_back1_gradient`}
        >
            <stop offset="0" stop-color="#ffab03" />
            <stop offset=".08938" stop-color="#ffab03" stop-opacity=".86889" />
            <stop offset=".28173" stop-color="#ffab03" stop-opacity=".60853" />
            <stop offset=".46471" stop-color="#ffab03" stop-opacity=".39138" />
            <stop offset=".63301" stop-color="#ffab03" stop-opacity=".22209" />
            <stop offset=".78353" stop-color="#ffab03" stop-opacity=".10055" />
            <stop offset=".91095" stop-color="#ffab03" stop-opacity=".02651" />
            <stop offset="1" stop-color="#ffab03" stop-opacity="0" />
        </radialGradient>
    </>
}

export function getBBoxCoords(
    bBox: { x: number, y: number, width: number, height: number },
    anchor: [number, number] = [0.5, 0.5],
) {
    const origin = [
        bBox.x + bBox.width * (anchor[0] ?? 0.5),
        bBox.y + bBox.height * (anchor[1] ?? 0.5),
    ] as [number, number];
    return origin;
}

const transparentTopCompansationCss = css`& { 
    margin-top: -562%; 
    margin-bottom: -29%;
    margin-left: -50%;
    margin-right: -50%;
}`;

const prevCss = (count: number) => slotIndices.map(i => css`
    & #prev_slot${i}_content {
        display: ${count <= i ? 'none' : 'unset'};
    }
    & #slot${i}_content {
        display: none;
    }
`);

const idleCss = (count: number) => slotIndices.map(i => css`
    & #prev_slot${i}_content {
        display: none;
    }
    & #slot${i}_content {
        display: ${count <= i ? 'none' : 'unset'};
    }
`);

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
function cleanAnimationCss({ i, now, start, duration }: {
    i: number,
    now: number,
    start: number,
    duration: number,
}) {
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
    return [
        ...slotIndices.map(i => css`
            & #prev_slot${i}_content {
                display: ${prevTube.length <= i ? 'none' : 'unset'};
            }
            & #slot${i}_content {
                display: ${tube.length <= i ? 'none' : 'unset'};
            }
        `),
        ...reaction.reagents.map((_, i, arr) => css`
            & #prev_slot${prevTube.length - arr.length + i}_content_ {
                animation: ${keyframes`
                    0% { transform: scale(1); }
                    50%, 100% { transform: scale(0); }
                `} ${duration}ms ${start - now}ms linear both;
            }`),
        ...reaction.products.map((_, i, arr) => css`
            & #slot${tube.length - arr.length + i}_content_ {
                animation: ${keyframes`
                    0%, 50% { transform: scale(0); }
                    100% { transform: scale(1); }
                `} ${duration}ms ${start - now}ms linear both;
            }`),
    ]
}


export function TubeSvg({
    tubeTransition: {
        prevState: prevTube,
        state: tube,
        desc,
        duration,
        start,
    },
    now,
    noBorder,
    svgIdPrefix,
    ...props
}: {
    tubeTransition: StateTransition<
        SubstanceId[],
        { id: "idle" | "prev" | "pourDown" | "pourUp" | "clean" }
        | { id: "react", reaction: Reaction }
    >;
    now: number;
    noBorder?: boolean;
    svgIdPrefix: string;
    className?: string;
    style?: JSX.CSSProperties;
}) {
    const tubeContentGradientsCss = slotIndices.map(i => {
        const prevColor = substanceColors[prevTube[i]] ?? "#00000000";
        const color = substanceColors[tube[i]] ?? "#00000000";
        return css`
            & #_${svgIdPrefix}_prev_slot${i}_content_back1_gradient * {
                stop-color: ${prevColor};
            }
            & #_${svgIdPrefix}_prev_slot${i}_content_back_gradient :nth-child(1) {
                stop-color: ${secondaryColor(prevColor)};
            }
            & #_${svgIdPrefix}_prev_slot${i}_content_back_gradient :nth-child(2) {
                stop-color: ${prevColor};
            }

            & #_${svgIdPrefix}_slot${i}_content_back1_gradient * {
                stop-color: ${color};
            }
            & #_${svgIdPrefix}_slot${i}_content_back_gradient :nth-child(1) {
                stop-color: ${secondaryColor(color)};
            }
            & #_${svgIdPrefix}_slot${i}_content_back_gradient :nth-child(2) {
                stop-color: ${color};
            }
        `;
    });
    const tubeContentCss = slotIndices.map(i => {
        const isNext = tube.length === i;
        return css`
            & #prev_slot${i}_content_back {
                fill: url(#_${svgIdPrefix}_prev_slot${i}_content_back_gradient);
            }
            & #prev_slot${i}_content_back1 {
                fill: url(#_${svgIdPrefix}_prev_slot${i}_content_back1_gradient);
            }

            & #slot${i}_content_back {
                fill: url(#_${svgIdPrefix}_slot${i}_content_back_gradient);
            }
            & #slot${i}_content_back1 {
                fill: url(#_${svgIdPrefix}_slot${i}_content_back1_gradient);
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

    return <>
        <TubeSvgRaw
            {...props}
            className={cx(
                slotTransformOriginsCss,
                textCss,
                transparentTopCompansationCss,
                tubeContentCss,
                "idle" === desc.id && idleCss(tube.length),
                "prev" === desc.id && prevCss(prevTube.length),
                "pourDown" === desc.id && [
                    idleCss(tube.length),
                    pourDownAnimationCss({
                        i: tube.length - 1,
                        duration, start, now
                    })],
                "pourUp" === desc.id && [
                    prevCss(prevTube.length),
                    pourUpAnimationCss({
                        i: prevTube.length - 1,
                        duration, start, now
                    })],
                "clean" === desc.id && [
                    prevCss(prevTube.length),
                    ...[3, 4].map(i => cleanAnimationCss({ i, duration, start, now })),
                ],
                "react" === desc.id && reactAnimationCss({
                    tube,
                    prevTube,
                    reaction: desc.reaction,
                    duration, start, now
                }),
                noBorder && [
                    css`& #border { display: none; }`,
                    ...slotIndices.map(i => css`& #slot${i}_add { display: none; }`),
                ],
                props.className)}
            slots={{
                ...tubeContentSlots,
            }} />
        <svg className={cx(
            tubeContentGradientsCss,
            css`& {
                position: absolute; 
                height: 0;
            }`,
        )}>
            <defs>
                {slotIndices.map(i => <>
                    <SlotGradients svgIdPrefix={svgIdPrefix} i={i} prev />
                    <SlotGradients svgIdPrefix={svgIdPrefix} i={i} />
                </>)}
            </defs>
        </svg>
    </>;
}