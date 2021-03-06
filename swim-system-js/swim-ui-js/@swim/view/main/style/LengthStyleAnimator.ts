// Copyright 2015-2020 SWIM.AI inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {__extends} from "tslib";
import {AnyLength, Length} from "@swim/length";
import {Tween, Transition} from "@swim/transition";
import {StyleAnimatorConstructor, StyleAnimator} from "./StyleAnimator";
import {ElementView} from "../ElementView";

/** @hidden */
export interface LengthStyleAnimator<V extends ElementView> extends StyleAnimator<V, Length, AnyLength> {
}

/** @hidden */
export const LengthStyleAnimator = (function (_super: typeof StyleAnimator): StyleAnimatorConstructor {
  const LengthStyleAnimator: StyleAnimatorConstructor = function <V extends ElementView>(
      this: LengthStyleAnimator<V>, view: V, names: string | ReadonlyArray<string>, value?: Length | null,
      transition?: Transition<Length> | null, priority?: string): LengthStyleAnimator<V> {
    let _this: LengthStyleAnimator<V> = function (value?: AnyLength | null, tween?: Tween<Length>, priority?: string | null): Length | null | undefined | V {
      if (value === void 0) {
        return _this.value;
      } else {
        if (value !== null) {
          value = Length.fromAny(value, view._node);
        }
        _this.setState(value, tween, priority);
        return _this._view;
      }
    } as LengthStyleAnimator<V>;
    (_this as any).__proto__ = this;
    _this = _super.call(_this, view, names, value, transition, priority) || _this;
    return _this;
  } as unknown as StyleAnimatorConstructor;
  __extends(LengthStyleAnimator, _super);

  Object.defineProperty(LengthStyleAnimator.prototype, "value", {
    get: function <V extends ElementView>(this: LengthStyleAnimator<V>): Length | null | undefined {
      let value = this._value;
      if (value === void 0) {
        const propertyValue = this.propertyValue;
        if (propertyValue) {
          try {
            value = Length.parse(propertyValue, this._view._node);
          } catch (swallow) {
            // nop
          }
        }
      }
      return value;
    },
    enumerable: true,
    configurable: true,
  });

  return LengthStyleAnimator;
}(StyleAnimator));
StyleAnimator.Length = LengthStyleAnimator;
