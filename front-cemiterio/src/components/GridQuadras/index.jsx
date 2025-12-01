import React, { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { Tile, Grid, GridWrap, TileBadge, TileLabel } from "./styles"

function GridQuadras({
    quadrasDesc = [],
    value,
    onChange,
    qid,
    created,
    num,
    quadrasArr,
    columnsMinWidth = 92,
    showStatus = true,
}) {
    const [internalSelected, setInternalSelected] = useState(null);

    const normalizeId = (v) => {
        if (v === undefined || v === null || v === "") return null;
        if (typeof v === "number") return Number.isNaN(v) ? null : v;
        if (/^\d+$/.test(String(v))) return Number(v);
        return String;
    };


    const normalizedQuadras = useMemo(() => {
        return (quadrasDesc || []).map((q) => ({
            ...q,
            id: normalizeId(q.id),
            num_quadra: q.num_quadra,

        }));
    }, [JSON.stringify(quadrasDesc)]);

    useEffect(() => {
        const resolvedQid = normalizeId(qid);
        if (resolvedQid !== null) {
            setInternalSelected(resolvedQid);
            return;
        }

        const resolvedCreated = normalizeId(created?.id);
        if (resolvedCreated !== null) {
            setInternalSelected(resolvedCreated);
            return;
        }

        const resolvedNum = normalizeId(num)
        if (resolvedNum !== null) {
            setInternalSelected(resolvedNum);
            return;
        }

        if (Array.isArray(quadrasArr) && quadrasArr.length) {
            setInternalSelected(null);
            return;
        }
        setInternalSelected(null);

    }, [qid, created, num, JSON.stringify(quadrasArr)]);

    useEffect(() => {
        if (value !== undefined) {
            if (value === undefined) return;
            const next = normalizeId(value);
            if (next === internalSelected) return;
            setInternalSelected(next);
        }
    }, [value, internalSelected]);

    useEffect(() => {
        if (!onChange) return;
        const item = normalizedQuadras.find((q) => q.id === internalSelected) ?? null;
        onChange(item);

    }, [internalSelected, JSON.stringify(normalizedQuadras)]);

    const handleToggle = (q) => {
        const next = internalSelected === q.id ? null : q.id;
        setInternalSelected(next);
    }

    normalizedQuadras.forEach((q, i) => {
        if (typeof q.id === "function") {
            console.error("[GridQuadras] bad id (function) at index", i, q);
        }
        if (q.id === undefined || q.id === null) {
            console.warn("[GridQuadras] null/undefined id at index", i, q);
        }
    });


    return (
        <GridWrap className="gridquad-wrap">
            <Grid className="gridquad" tileMinWidth={`${columnsMinWidth}px`}>
                {normalizedQuadras.map((q) => {
                    const isSelected = internalSelected === q.id;
                    return (
                        <Tile key={String(q.id)}
                            type="button"
                            selected={isSelected}
                            status={q.status}
                            onClick={() => handleToggle(q)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    handleToggle(q);
                                }
                            }}
                            aria-pressed={isSelected}
                            title={`${q.num_quadra}${q.status ? ` - ${q.status}` : ""}`}
                        >
                            <TileLabel>{q.num_quadra}</TileLabel>
                            {showStatus && <TileBadge>{q.status ?? ""}</TileBadge>}
                        </Tile>
                    )

                })}
            </Grid>
        </GridWrap >

    )
}

GridQuadras.propTypes = {
    quadrasDesc: PropTypes.array,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onChange: PropTypes.func,
    qid: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    created: PropTypes.object,
    num: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    quadrasArr: PropTypes.array,
    columnsMinWidth: PropTypes.number,
    showStatus: PropTypes.bool,
};

export default GridQuadras;

