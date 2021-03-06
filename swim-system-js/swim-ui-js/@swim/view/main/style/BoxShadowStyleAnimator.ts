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
import {AnyBoxShadow, BoxShadow} from "@swim/style";
import {Tween, Transition} from "@swim/transition";
import {StyleAnimatorConstructor, StyleAnimator} from "./StyleAnimator";
import {ElementView} from "../ElementView";

/** @hidden */
export interface BoxShadowStyleAnimator<V extends ElementView> extends StyleAnimator<V, BoxShadow, AnyBoxShadow> {
}

/** @hidden */
export const BoxShadowStyleAnimator = (function (_super: typeof StyleAnimator): StyleAnimatorConstructor {
  const BoxShadowStyleAnimator: StyleAnimatorConstructor = function <V extends ElementView>(
      this: BoxShadowStyleAnimator<V>, view: V, names: string | ReadonlyArray<string>, value?: BoxShadow | null,
      transition?: Transition<BoxShadow> | null, priority?: string): BoxShadowStyleAnimator<V> {
    let _this: BoxShadowStyleAnimator<V> = function (value?: AnyBoxShadow | null, tween?: Tween<BoxShadow>, priority?: string | null): BoxShadow | null | undefined | V {
      if (value === void 0) {
        return _this.value;
      } else {
        if (value !== null) {
          value = BoxShadow.fromAny(value);
        }
        _this.setState(value as BoxShadow | null, tween, priority);
        return _this._view;
      }
    } as BoxShadowStyleAnimator<V>;
    (_this as any).__proto__ = this;
    _this = _super.call(_this, view, names, value, transition, priority) || _this;
    return _this;
  } as unknown as StyleAnimatorConstructor;
  __extends(BoxShadowStyleAnimator, _super);

  Object.defineProperty(BoxShadowStyleAnimator.prototype, "value", {
    get: function <V extends ElementView>(this: BoxShadowStyleAnimator<V>): BoxShadow | null | undefined {
      let value = this._value;
      if (value === void 0) {
        const propertyValue = this.propertyValue;
        if (propertyValue) {
          try {
            value = BoxShadow.parse(propertyValue);
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

  return BoxShadowStyleAnimator;
}(StyleAnimator));
StyleAnimator.BoxShadow = BoxShadowStyleAnimator;
