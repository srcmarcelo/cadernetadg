import React from "react";
import RenderValue from "../RenderValue";
import { TotalContainer, TotalLabel } from "./styles";

export default function Total({array, color}) {
    let total = 0;
    array.forEach((item, index) => {
      if (item.value && !(item.payed || item.received || item.disabled)) {
        if (index === 0) total = item.value;
        else total += item.value;
      }
    });

    return (
      <TotalContainer color={color}>
        <TotalLabel>Valor total:</TotalLabel>
        <div>
          <RenderValue value={total} color='#fff' fontSize='1.3rem' />
        </div>
      </TotalContainer>
    );
  };
