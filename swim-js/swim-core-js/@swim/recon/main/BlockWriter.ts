// Copyright 2015-2019 SWIM.AI inc.
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

import {Cursor} from "@swim/util";
import {Output, WriterException, Writer} from "@swim/codec";
import {ReconWriter} from "./ReconWriter";

/** @hidden */
export class BlockWriter<I, V> extends Writer {
  private readonly _recon: ReconWriter<I, V>;
  private readonly _items: Cursor<I>;
  private readonly _inBlock: boolean;
  private readonly _inMarkup: boolean;
  private readonly _inBraces: boolean | undefined;
  private readonly _inBrackets: boolean | undefined;
  private readonly _first: boolean | undefined;
  private readonly _markupSafe: boolean | undefined;
  private readonly _item: I | undefined;
  private readonly _next: I | undefined;
  private readonly _part: Writer | undefined;
  private readonly _step: number | undefined;

  constructor(recon: ReconWriter<I, V>, items: Cursor<I>, inBlock: boolean, inMarkup: boolean,
              inBraces?: boolean, inBrackets?: boolean, first?: boolean, markupSafe?: boolean,
              item?: I, next?: I, part?: Writer, step?: number) {
    super();
    this._recon = recon;
    this._items = items;
    this._inBlock = inBlock;
    this._inMarkup = inMarkup;
    this._inBraces = inBraces;
    this._inBrackets = inBrackets;
    this._first = first;
    this._markupSafe = markupSafe;
    this._item = item;
    this._next = next;
    this._part = part;
    this._step = step;
  }

  pull(output: Output): Writer {
    return BlockWriter.write(output, this._recon, this._items, this._inBlock, this._inMarkup,
                             this._inBraces, this._inBrackets, this._first, this._markupSafe,
                             this._item, this._next, this._part, this._step);
  }

  static sizeOf<I, V>(recon: ReconWriter<I, V>, items: Cursor<I>,
                      inBlock: boolean, inMarkup: boolean): number {
    let size = 0;
    let inBraces = false;
    let inBrackets = false;
    let first = true;
    let markupSafe = true;
    let next: I | undefined;
    while (next || items.hasNext()) {
      let item: I | undefined;
      if (!next ) {
        item = items.next().value!;
      } else {
        item = next;
        next = void 0;
      }
      if (items.hasNext()) {
        next = items.next().value!;
      }
      if (recon.isExpression(item)) {
        markupSafe = false;
      }
      if (inBrackets && recon.isAttr(item)) {
        if (inBraces) {
          size += 1; // '}'
          inBraces = false;
        }
        size += 1; // ']'
        inBrackets = false;
      }
      if (recon.isAttr(item)) {
        if (inBraces) {
          size += 1; // '}'
          inBraces = false;
        } else if (inBrackets) { // FIXME: case already covered?
          size += 1; // ']'
          inBrackets = false;
        }
        size += recon.sizeOfItem(item);
        first = false;
      } else if (inBrackets && recon.isText(item)) {
        if (inBraces) {
          size += 1; // '}'
          inBraces = false;
        }
        size += recon.sizeOfMarkupText(item);
      } else if (inBraces) {
        if (!first) {
          size += 1; // ','
        } else {
          first = false;
        }
        size += BlockWriter.sizeOfBlockItem(recon, item);
      } else if (inBrackets) {
        if (recon.isRecord(item) && recon.isMarkupSafe(recon.items(item))) {
          size += recon.sizeOfBlock(recon.items(item), false, true);
          if (next && recon.isText(next)) {
            size += recon.sizeOfMarkupText(next);
            next = void 0;
          } else if (next && !recon.isAttr(next)) {
            size += 1; // '{'
            inBraces = true;
            first = true;
          } else {
            size += 1; // ']'
            inBrackets = false;
          }
        } else {
          size += 1; // '{'
          size += recon.sizeOfItem(item);
          inBraces = true;
          first = false;
        }
      } else if (markupSafe && recon.isText(item) && next && !recon.isField(next)
              && !recon.isText(next) && !recon.isBool(next)) {
        size += 1; // '['
        size += recon.sizeOfMarkupText(item);
        inBrackets = true;
      } else if (inBlock && !inBraces) {
        if (!first) {
          size += 1; // ','
        } else {
          first = false;
        }
        size += BlockWriter.sizeOfBlockItem(recon, item);
      } else if (inMarkup && recon.isText(item) && !next) {
        size += 1; // '['
        size += recon.sizeOfMarkupText(item);
        size += 1; // ']'
      } else if (!inMarkup && recon.isValue(item) && !recon.isRecord(item)
             && (!first && !next || next && recon.isAttr(next))) {
        if (!first && (recon.isText(item) && recon.isIdent(item)
                    || recon.isNum(item) || recon.isBool(item))) {
          size += 1; // ' '
        }
        size += recon.sizeOfItem(item);
      } else {
        size += 1; // '{'
        size += recon.sizeOfItem(item);
        inBraces = true;
        first = false;
      }
    }
    if (inBraces) {
      size += 1; // '}'
    }
    if (inBrackets) {
      size += 1; // ']'
    }
    return size;
  }

  static sizeOfBlockItem<I, V>(recon: ReconWriter<I, V>, item: I): number {
    let size = 0;
    if (recon.isField(item)) {
      size += recon.sizeOfSlot(recon.key(item), recon.value(item));
    } else {
      size += recon.sizeOfItem(item);
    }
    return size;
  }

  static write<I, V>(output: Output, recon: ReconWriter<I, V>, items: Cursor<I>,
                     inBlock: boolean, inMarkup: boolean, inBraces: boolean = false,
                     inBrackets: boolean = false, first: boolean = true, markupSafe: boolean = true,
                     item?: I, next?: I, part?: Writer, step: number = 1): Writer {
    do {
      if (step === 1) {
        if (!next && !items.hasNext()) {
          step = 10;
          break;
        } else {
          if (!next) {
            item = items.next().value!;
          } else {
            item = next;
            next = void 0;
          }
          if (items.hasNext()) {
            next = items.next().value!;
          }
          if (recon.isExpression(item)) {
            markupSafe = false;
          }
          step = 2;
        }
      }
      if (step === 2 && output.isCont()) {
        if (inBrackets && recon.isAttr(item!)) {
          if (inBraces) {
            output = output.write(125/*'}'*/);
            inBraces = false;
          }
          step = 3;
        } else {
          step = 4;
        }
      }
      if (step === 3 && output.isCont()) {
        output = output.write(93/*']'*/);
        inBrackets = false;
        step = 4;
      }
      if (step === 4 && output.isCont()) {
        if (recon.isAttr(item!)) {
          if (inBraces) {
            output = output.write(125/*'}'*/);
            inBraces = false;
          } else if (inBrackets) {
            output = output.write(93/*']'*/);
            inBrackets = false;
          }
          part = recon.writeItem(item!, output);
          first = false;
          step = 7;
        } else if (inBrackets && recon.isText(item!)) {
          if (inBraces) {
            output = output.write(125/*'}'*/);
            inBraces = false;
          }
          part = recon.writeMarkupText(item!, output);
          step = 7;
        } else if (inBraces) {
          if (!first) {
            output = output.write(44/*','*/);
          } else {
            first = false;
          }
          part = BlockWriter.writeBlockItem(output, recon, item!);
          step = 7;
        } else if (inBrackets) {
          if (recon.isRecord(item!) && recon.isMarkupSafe(recon.items(item!))) {
            part = recon.writeBlock(recon.items(item!), output, false, true);
            step = 5;
          } else {
            output = output.write(123/*'{'*/);
            part = recon.writeItem(item!, output);
            inBraces = true;
            first = false;
            step = 7;
          }
        } else if (markupSafe && recon.isText(item!) && next && !recon.isField(next)
                && !recon.isText(next) && !recon.isBool(next)) {
          output = output.write(91/*'['*/);
          part = recon.writeMarkupText(item!, output);
          inBrackets = true;
          step = 7;
        } else if (inBlock && !inBraces) {
          if (!first) {
            output = output.write(44/*','*/);
          } else {
            first = false;
          }
          part = BlockWriter.writeBlockItem(output, recon, item!);
          step = 7;
        } else if (inMarkup && recon.isText(item!) && !next) {
          output = output.write(91/*'['*/);
          part = recon.writeMarkupText(item!, output);
          step = 8;
        } else if (!inMarkup && recon.isValue(item!) && !recon.isRecord(item!)
               && (!first && !next || next && recon.isAttr(next))) {
          if (!first && (recon.isText(item!) && recon.isIdent(item!)
                      || recon.isNum(item!) || recon.isBool(item!))) {
            output = output.write(32/*' '*/);
          }
          part = recon.writeItem(item!, output);
          step = 7;
        } else {
          output = output.write(123/*'{'*/);
          part = recon.writeItem(item!, output);
          inBraces = true;
          first = false;
          step = 7;
        }
      }
      if (step === 5) {
        part = part!.pull(output);
        if (part.isDone()) {
          part = void 0;
          step = 6;
        } else if (part.isError()) {
          return part.asError();
        }
      }
      if (step === 6 && output.isCont()) {
        if (next && recon.isText(next)) {
          part = recon.writeMarkupText(next, output);
          next = void 0;
          step = 7;
        } else if (next && !recon.isAttr(next)) {
          output = output.write(123/*'{'*/);
          inBraces = true;
          first = true;
          step = 1;
          continue;
        } else {
          output = output.write(93/*']'*/);
          inBrackets = false;
          step = 1;
          continue;
        }
      }
      if (step === 7) {
        part = part!.pull(output);
        if (part.isDone()) {
          part = void 0;
          step = 1;
          continue;
        } else if (part.isError()) {
          return part.asError();
        }
      }
      if (step === 8) {
        part = part!.pull(output);
        if (part.isDone()) {
          part = void 0;
          step = 9;
        } else if (part.isError()) {
          return part.asError();
        }
      }
      if (step === 9 && output.isCont()) {
        output = output.write(93/*']'*/);
        step = 1;
        continue;
      }
      break;
    } while (true);
    if (step === 10) {
      if (inBraces) {
        if (output.isCont()) {
          output = output.write(125/*'}'*/);
          step = 11;
        }
      } else {
        step = 11;
      }
    }
    if (step === 11) {
      if (inBrackets) {
        if (output.isCont()) {
          output = output.write(93/*']'*/);
          return Writer.done();
        }
      } else {
        return Writer.done();
      }
    }
    if (output.isDone()) {
      return Writer.error(new WriterException("truncated"));
    } else if (output.isError()) {
      return Writer.error(output.trap());
    }
    return new BlockWriter<I, V>(recon, items, inBlock, inMarkup, inBraces, inBrackets,
                                 first, markupSafe, item, next, part, step);
  }

  static writeBlockItem<I, V>(output: Output, recon: ReconWriter<I, V>, item: I): Writer {
    if (recon.isField(item)) {
      return recon.writeSlot(recon.key(item), recon.value(item), output);
    } else {
      return recon.writeItem(item, output);
    }
  }
}