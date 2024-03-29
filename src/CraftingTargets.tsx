import { css, cx, keyframes } from "@emotion/css";
import { useRecoilValue } from "recoil";
import { buttonCss } from "./buttonCss";
import * as flex from "./utils/flex";
import { DoubleArrow } from '@emotion-icons/material-rounded/DoubleArrow';
import { TouchAppAnimation } from "./TouchAppAnimation";
import { useCraftingTransition, useSetNextProblem } from "./solutionRecoil";
import { tutorialRecoil } from "./tutorialRecoil";
import { JSX } from "preact";
import { TubeSvg } from "./TubeSvg";
import { SubstanceId } from "./puzzle/state";

const fakeEmptyTube = [] as SubstanceId[];
function Tube({ revI, ...props }: {
    revI: number;
    className?: string;
    style?: JSX.CSSProperties;
}) {
    const setNextLevel = useSetNextProblem();

    const craftingStateInTime = useCraftingTransition();
    const now = craftingStateInTime.currentTime;
    const craftingState = craftingStateInTime.currentState;

    const fake = revI < 0;

    const prevTube =
        fake ? fakeEmptyTube : [...craftingState.prevState.targets].reverse()[revI];
    const tube =
        fake ? fakeEmptyTube : [...craftingState.state.targets].reverse()[revI];
    const i = craftingState.prevState.targets.length - 1 - revI;

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
            svgIdPrefix={`TargetTubeLast${revI}`}
            noBorder
            className={cx(
            )}
            tubeTransition={{
                prevState: prevTube ?? [],
                state: tube ?? [],
                start: craftingState.start,
                duration: craftingState.duration,
                desc: { id: "prev" },
            }}
            now={now}
            inactive
        />
        {fake && <button
            disabled={craftingState.prevState.targets.length > 0}
            onClick={setNextLevel}
            className={cx(buttonCss, css`& {
                display: block;
                position: absolute;
                inset: 13% 22% 3%;
                border: 2px dashed transparent;
                border-top-left-radius: 3px 6px;
                border-top-right-radius: 3px 6px;
                border-bottom-left-radius: 9px;
                border-bottom-right-radius: 9px;
            }`)}
        ><DoubleArrow style={{ margin: "0 -10px 0 -12px" }} /></button>}
        {(i > 1 || (i === 1 && craftingState.id !== "giveaway")) && <div className={cx(css`& {
            position: absolute;
            inset: 0;
            border-bottom-left-radius: 999px;
            border-bottom-right-radius: 999px;
            overflow: hidden;
        }`)}>
            <div style={{
                position: "absolute",
                top: 0,
                right: "47%",
                width: "100%",
                bottom: "-5px",
                background: "#00000030",
                borderBottomLeftRadius: "999px",
                borderBottomRightRadius: "999px",
            }}></div>
        </div>}
    </div>;
}

export function CraftingTargets({ style, className }: {
    style?: JSX.CSSProperties,
    className?: string,
}) {
    const craftingStateInTime = useCraftingTransition();
    const now = craftingStateInTime.currentTime;
    const craftingState = craftingStateInTime.currentState;
    const { start, duration } = craftingState;

    const tutorial = useRecoilValue(tutorialRecoil);
    const hintNext = tutorial.find(t => t.kind === "next");

    const tubes = craftingState.state.targets;
    const prevTubes = craftingState.prevState.targets;

    const stubTubes = Array.from({ length: Math.max(tubes.length, prevTubes.length) + 1 });

    const isHinted = (slotIndex: number) =>
        tutorial.some(t =>
            t.kind === "target"
            && t.slotIndex === slotIndex);

    const _dz = (i: number) =>
        i === -1 ? 41 : (i === 0 ? 0 : -(Math.pow((i - 1), 0.4) * 20 + 40));
    const _dy = (i: number) =>
        i === -1 ? 5 : 0;
    const _dx = (i: number) =>
        i === -1 ? 43 : (i === 0 ? 0 : -(i * 23 - 8));

    return <div
        className={cx(className)}
        style={{
            ...flex.rowS,
            ...style,
            position: "relative",
            perspective: "120px",
            perspectiveOrigin: "center 120px",
            transformStyle: "preserve-3d",
        }}
    >
        {stubTubes.map((_, i, arr) => {

            const x = -_dx(i);
            const y = _dy(i);
            const z = _dz(i);
            const dx = -_dx(i - 1) - x;
            const dy = _dy(i - 1) - y;
            const dz = _dz(i - 1) - z;

            const revI = arr.length - 1 - i - 1;
            return <div
                key={revI}
                className={cx(css`& {
                position: absolute;
                transform: translate3d(${x}px, ${y}px, ${z}px);
                transform-style: preserve-3d;
            }`)}
            >
                <Tube
                    revI={revI}
                    className={cx(
                        craftingState.id === 'giveaway'
                        && i > 0
                        && css`& {
                            animation: ${keyframes`
                                50% { transform: translate3d(0px, 0px, 0px); }
                                100% { transform: translate3d(${dx}px, ${dy}px, ${dz}px); }
                            `} ${duration}ms ${start - now}ms both linear;
                        } `,
                        craftingState.id === 'giveaway'
                        && i === 0
                        && css`& {
                            animation: ${keyframes`
                                0%, 2% { transform: translateY(0); }
                                7% { transform: translateY(-12%); }
                                10%, 39% { transform: translateY(-10%); opacity: 1; }
                                40% { transform: translateY(-8%); }
                                41% { transform: translateY(-10%); }
                                66%, 100% { transform: translateY(-25%); opacity: 0; }
                            `} ${duration}ms ${start - now}ms both linear;
                        }`,
                    )}
                />
            </div>;
        })}
        {(hintNext && craftingState.id === "idle")
            && <TouchAppAnimation
                className={css`& {
                    position: absolute;
                    transform: translate(20px, 120px);
                }`}
                startTime={start + (hintNext.delay ?? 0)}
            />}
        {craftingState.id === "idle" && isHinted(0) && <div className={css`& {
            z-index: 1;
            position: absolute;
            bottom: 17px;
            left: 6px;
            width: 21px;
            height: 39px;
            border: 2px solid #ffffffa0;
            border-radius: 3px;
            animation: ${keyframes`
                0% { transform: scale(1, 1); }
                10% { transform: scale(1.5, 1.5); }
                30% { transform: scale(1, 1); }
                100% { transform: scale(1, 1); }
                # ${now}
            `} 1300ms ${-now}ms infinite both linear;
        }`}></div>}
        {craftingState.id === "idle" && isHinted(1) && <div className={css`& {
            z-index: 1;
            position: absolute;
            bottom: 62px;
            left: 6px;
            width: 21px;
            height: 39px;
            border: 2px solid #ffffffa0;
            border-radius: 3px;
            animation: ${keyframes`
                0% { transform: scale(1, 1); }
                10% { transform: scale(1.5, 1.5); }
                30% { transform: scale(1, 1); }
                100% { transform: scale(1, 1); }
                # ${now}
            `} 1300ms ${-now}ms infinite both linear;
        }`}></div>}
        {craftingState.id === "idle" && isHinted(2) && <div className={css`& {
            z-index: 1;
            position: absolute;
            bottom: 111px;
            left: 6px;
            width: 21px;
            height: 39px;
            border: 2px solid #ffffffa0;
            border-radius: 3px;
            animation: ${keyframes`
                0% { transform: scale(1, 1); }
                10% { transform: scale(1.5, 1.5); }
                30% { transform: scale(1, 1); }
                100% { transform: scale(1, 1); }
                # ${now}
            `} 1300ms ${-now}ms infinite both linear;
        }`}></div>}
    </div>;
}