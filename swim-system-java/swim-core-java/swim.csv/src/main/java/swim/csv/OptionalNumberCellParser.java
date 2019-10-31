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

package swim.csv;

import swim.codec.Input;
import swim.codec.Parser;
import swim.structure.Item;
import swim.structure.Value;

final class OptionalNumberCellParser extends Parser<Item> {
  final Value key;

  OptionalNumberCellParser(Value key) {
    this.key = key;
  }

  @Override
  public Parser<Item> feed(Input input) {
    return parse(input, this.key);
  }

  static Parser<Item> parse(Input input, Value key) {
    if (input.isCont()) {
      return NumberCellParser.parse(input, key);
    } else if (input.isDone()) {
      return done();
    } else if (input.isError()) {
      return error(input.trap());
    }
    return new OptionalNumberCellParser(key);
  }
}