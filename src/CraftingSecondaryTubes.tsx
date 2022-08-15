import * as flex from "./utils/flex";
import { css, cx, keyframes } from "@emotion/css";
import { JSX } from "preact";
import { useCraftingState } from "./craftingActionsRecoil";

import { PourFromSecondaryIntoMainButton } from "./PourFromSecondaryIntoMainButton";
import { TubeSvg } from "./TubeSvg";


function Tube({ i, ...props }: {
    i: number;
    className?: string;
    style?: JSX.CSSProperties;
}) {
    const craftingStateInTime = useCraftingState();
    const now = craftingStateInTime.currentTime;
    const craftingState = craftingStateInTime.currentState;

    const tube = craftingState.state.tubes[i + 1];
    const prevTube = craftingState.prevState.tubes[i + 1];
    const isSecondaryAvailable = craftingState.state.tubes.length > 1;

    const reaction =
        craftingState.id === "craftingReact"
        && craftingState.diffCustom.find(d => d[0] === i + 1)?.[1];

    return <div
        className={cx(
            css`& {
                position: relative;
                width: 37px;
            }`,
            props.className)
        }
        style={props.style}
    >
        <TubeSvg
            noBorder
            className={cx(
            )}
            tubeTransition={{
                prevState: prevTube ?? [],
                state: tube ?? [],
                start: craftingState.start,
                duration: craftingState.duration,
                desc: (() => {
                    if (craftingState.id === "craftingAct") {
                        switch (craftingState.diffCustom.action) {
                            case "trashTube":
                                return { id: "prev" };
                            case "pourFromMainIntoSecondary":
                                if (i === 0) {
                                    return { id: "pourDown" };
                                }
                            case "pourFromSecondaryIntoMain":
                                if (i === 0) {
                                    return { id: "pourUp" };
                                }
                        }
                    }
                    if (craftingState.id === "craftingReact" && reaction) {
                        return { id: "react", reaction };
                    }
                    if (craftingState.id === "craftingCleanup") {
                        return { id: "clean" };
                    }
                    if (craftingState.id === "craftingGiveaway") {
                        return { id: "prev" };
                    }
                    return { id: "idle" };
                })(),
            }}
            now={now}
        />
        {isSecondaryAvailable && i == 0 && tube.length > 0 && <PourFromSecondaryIntoMainButton
            style={{
                position: "absolute",
                right: "-10px",
                top: ["64%", "42%", "19%"][tube.length - 1],
            }}
        />}
        {i !== 0 && <div className={cx(css`& {
            position: absolute;
            inset: 0 0 0 0;
            border-bottom-left-radius: 999px;
            border-bottom-right-radius: 999px;
            overflow: hidden;
            width: 100%;
            height: 100%;
        }`)}>
            <div style={{
                position: "absolute",
                top: 0,
                left: "47%",
                right: "-47%",
                bottom: "-5px",
                background: "#00000040",
                borderBottomLeftRadius: "999px",
                borderBottomRightRadius: "999px",
            }}></div></div>}
    </div>;
}


export function CraftingSecondaryTubes({
    className, ...props
}: {
    className?: string;
    style?: JSX.CSSProperties;
}) {
    const craftingStateInTime = useCraftingState();
    const now = craftingStateInTime.currentTime;
    const craftingState = craftingStateInTime.currentState;
    const { start, duration } = craftingState;
    const tubes = craftingState.state.tubes;
    const prevTubes = craftingState.prevState.tubes;

    const renderTubes =
        craftingState.id === "craftingAct" && craftingState.diffCustom.action === "trashTube"
            ? prevTubes
            : tubes;

    return <div
        {...props}
        className={cx(flex.rowRev, css`& {
            position: relative;
            perspective: 120px;
            perspective-origin: center 120px;
            transform-style: preserve-3d;
        }`, className)}
    >
        {renderTubes.slice(1).map((t, i) => {
            const _dz = (i: number) =>
                i === -1 ? 39 : (i === 0 ? 0 : -(Math.pow((i - 1), 0.4) * 20 + 40));
            const _dx = (i: number) =>
                i === -1 ? 43 : (i === 0 ? 0 : -(i * 23 - 8));

            const prevDx = _dx(i - 1);
            const prevDz = _dz(i - 1);
            const dx = _dx(i);
            const dz = _dz(i);

            return <Tube
                i={i}
                className={cx(
                    css`& {
                        position: absolute;
                        transform: translate3d(${dx}px, 0, ${dz}px);
                    }`,
                    craftingState.id === 'craftingAct'
                    && craftingState.diffCustom.action === 'addTube'
                    && css`& {
                        animation: ${keyframes`
                            0% { transform: translate3d(${prevDx}px, 0, ${prevDz}px); }
                            100% { transform: translate3d(${dx}px, 0, ${dz}px); }
                        `} ${duration}ms ${start - now}ms both linear;
                    }`,
                    craftingState.id === 'craftingAct'
                    && craftingState.diffCustom.action === 'trashTube'
                    && css`& {
                        animation: ${keyframes`
                            0% { transform: translate3d(${dx}px, 0, ${dz}px); }
                            100% { transform: translate3d(${prevDx}px, 0, ${prevDz}px); }
                        `} ${duration}ms ${start - now}ms both linear;
                    }`,
                    craftingState.id === 'craftingGiveaway'
                    && css`
                        & {
                            transform-origin: bottom;
                            animation: ${keyframes`
                            35% { transform: translate3d(${dx}px, 0, ${dz}px); }
                            100% { transform: translate3d(${prevDx}px, 0, ${prevDz}px); }
                                `} ${duration}ms ${start - now}ms both linear;
                            } 
                        `,
                )}
            />;
        })}
    </div>;
}
