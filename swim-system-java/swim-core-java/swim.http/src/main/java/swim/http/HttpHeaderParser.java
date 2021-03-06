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

package swim.http;

import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parser;

final class HttpHeaderParser extends Parser<HttpHeader> {

  final HttpParser http;
  final StringBuilder name;
  final Parser<? extends HttpHeader> value;
  final int step;

  HttpHeaderParser(HttpParser http, StringBuilder name, Parser<? extends HttpHeader> value, int step) {
    this.http = http;
    this.name = name;
    this.value = value;
    this.step = step;
  }

  HttpHeaderParser(HttpParser http) {
    this(http, null, null, 1);
  }

  @SuppressWarnings("unchecked")
  static Parser<HttpHeader> parse(Input input, HttpParser http, StringBuilder name,
                                  Parser<? extends HttpHeader> value, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont()) {
        c = input.head();
        if (Http.isTokenChar(c)) {
          input = input.step();
          if (name == null) {
            name = new StringBuilder();
          }
          name.appendCodePoint(c);
          step = 2;
        } else {
          return error(Diagnostic.expected("HTTP header name", input));
        }
      } else if (input.isDone()) {
        return error(Diagnostic.expected("HTTP header name", input));
      }
    }
    if (step == 2) {
      while (input.isCont()) {
        c = input.head();
        if (Http.isTokenChar(c)) {
          input = input.step();
          name.appendCodePoint(c);
        } else {
          break;
        }
      }
      if (input.isCont()) {
        step = 3;
      } else if (input.isDone()) {
        return error(Diagnostic.unexpected(input));
      }
    }
    if (step == 3) {
      if (input.isCont() && input.head() == ':') {
        input = input.step();
        step = 4;
      } else if (!input.isEmpty()) {
        return error(Diagnostic.expected(':', input));
      }
    }
    if (step == 4) {
      while (input.isCont()) {
        c = input.head();
        if (Http.isSpace(c)) {
          input = input.step();
        } else {
          break;
        }
      }
      if (!input.isEmpty()) {
        step = 5;
      }
    }
    if (step == 5) {
      if (value == null) {
        value = http.parseHeaderValue(name.toString(), input);
      } else {
        value = value.feed(input);
      }
      if (value.isDone()) {
        step = 6;
      } else if (value.isError()) {
        return value.asError();
      }
    }
    if (step == 6) {
      while (input.isCont()) {
        c = input.head();
        if (Http.isSpace(c)) {
          input = input.step();
        } else {
          break;
        }
      }
      if (!input.isEmpty()) {
        return (Parser<HttpHeader>) value;
      }
    }
    if (input.isError()) {
      return error(input.trap());
    }
    return new HttpHeaderParser(http, name, value, step);
  }

  static Parser<HttpHeader> parse(Input input, HttpParser http) {
    return parse(input, http, null, null, 1);
  }

  @Override
  public Parser<HttpHeader> feed(Input input) {
    return parse(input, this.http, this.name, this.value, this.step);
  }

}
