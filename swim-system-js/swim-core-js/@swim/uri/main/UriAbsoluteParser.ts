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

import {Input, Parser, Diagnostic} from "@swim/codec";
import {Uri} from "./Uri";
import {UriScheme} from "./UriScheme";
import {UriAuthority} from "./UriAuthority";
import {UriPath} from "./UriPath";
import {UriQuery} from "./UriQuery";
import {UriFragment} from "./UriFragment";
import {UriParser} from "./UriParser";

/** @hidden */
export class UriAbsoluteParser extends Parser<Uri> {
  private readonly uri: UriParser;
  private readonly schemeParser: Parser<UriScheme> | undefined;
  private readonly authorityParser: Parser<UriAuthority> | undefined;
  private readonly pathParser: Parser<UriPath> | undefined;
  private readonly queryParser: Parser<UriQuery> | undefined;
  private readonly fragmentParser: Parser<UriFragment> | undefined;
  private readonly step: number | undefined;

  constructor(uri: UriParser, schemeParser?: Parser<UriScheme>,
              authorityParser?: Parser<UriAuthority>, pathParser?: Parser<UriPath>,
              queryParser?: Parser<UriQuery>, fragmentParser?: Parser<UriFragment>, step?: number) {
    super();
    this.uri = uri;
    this.schemeParser = schemeParser;
    this.authorityParser = authorityParser;
    this.pathParser = pathParser;
    this.queryParser = queryParser;
    this.fragmentParser = fragmentParser;
    this.step = step;
  }

  feed(input: Input): Parser<Uri> {
    return UriAbsoluteParser.parse(input, this.uri, this.schemeParser, this.authorityParser,
                                   this.pathParser, this.queryParser, this.fragmentParser, this.step);
  }

  static parse(input: Input, uri: UriParser, schemeParser?: Parser<UriScheme>,
               authorityParser?: Parser<UriAuthority>, pathParser?: Parser<UriPath>,
               queryParser?: Parser<UriQuery>, fragmentParser?: Parser<UriFragment>,
               step: number = 1): Parser<Uri> {
    let c = 0;
    if (step === 1) {
      if (input.isCont()) {
        const look = input.clone();
        while (look.isCont() && (c = look.head(), Uri.isSchemeChar(c))) {
          look.step();
        }
        if (look.isCont() && c === 58/*':'*/) {
          step = 2;
        } else {
          step = 3;
        }
      } else if (input.isDone()) {
        step = 3;
      }
    }
    if (step === 2) {
      if (!schemeParser) {
        schemeParser = uri.parseScheme(input);
      } else {
        schemeParser = schemeParser.feed(input);
      }
      if (schemeParser.isDone()) {
        if (input.isCont() && input.head() === 58/*':'*/) {
          input = input.step();
          step = 3;
        } else if (!input.isEmpty()) {
          return Parser.error(Diagnostic.expected(58/*':'*/, input));
        }
      } else if (schemeParser.isError()) {
        return schemeParser.asError();
      }
    }
    if (step === 3) {
      if (input.isCont()) {
        c = input.head();
        if (c === 47/*'/'*/) {
          input = input.step();
          step = 4;
        } else if (c === 63/*'?'*/) {
          input = input.step();
          step = 7;
        } else if (c === 35/*'#'*/) {
          input = input.step();
          step = 8;
        } else {
          step = 6;
        }
      } else if (input.isDone()) {
        return Parser.done(uri.absolute(schemeParser && schemeParser.bind()));
      }
    }
    if (step === 4) {
      if (input.isCont() && input.head() === 47/*'/'*/) {
        input = input.step();
        step = 5;
      } else if (input.isCont()) {
        const pathBuilder = uri.pathBuilder();
        pathBuilder.addSlash();
        pathParser = uri.parsePath(input, pathBuilder);
        step = 6;
      } else if (input.isDone()) {
        return Parser.done(uri.absolute(schemeParser && schemeParser.bind(),
                                        void 0,
                                        Uri.Path.slash()));
      }
    }
    if (step === 5) {
      if (!authorityParser) {
        authorityParser = uri.parseAuthority(input);
      } else {
        authorityParser = authorityParser.feed(input);
      }
      if (authorityParser.isDone()) {
        if (input.isCont()) {
          c = input.head();
          if (c === 63/*'?'*/) {
            input = input.step();
            step = 7;
          } else if (c === 35/*'#'*/) {
            input = input.step();
            step = 8;
          } else {
            step = 6;
          }
        } else if (input.isDone()) {
          return Parser.done(uri.absolute(schemeParser && schemeParser.bind(),
                                          authorityParser && authorityParser.bind()));
        }
      } else if (authorityParser.isError()) {
        return authorityParser.asError();
      }
    }
    if (step === 6) {
      if (!pathParser) {
        pathParser = uri.parsePath(input);
      } else {
        pathParser = pathParser.feed(input);
      }
      if (pathParser.isDone()) {
        if (input.isCont() && input.head() === 63/*'?'*/) {
          input = input.step();
          step = 7;
        } else if (input.isCont() && input.head() === 35/*'#'*/) {
          input = input.step();
          step = 8;
        } else if (!input.isEmpty()) {
          return Parser.done(uri.absolute(schemeParser && schemeParser.bind(),
                                          authorityParser && authorityParser.bind(),
                                          pathParser.bind()));
        }
      } else if (pathParser.isError()) {
        return pathParser.asError();
      }
    }
    if (step === 7) {
      if (!queryParser) {
        queryParser = uri.parseQuery(input);
      } else {
        queryParser = queryParser.feed(input);
      }
      if (queryParser.isDone()) {
        if (input.isCont() && input.head() === 35/*'#'*/) {
          input = input.step();
          step = 8;
        } else if (!input.isEmpty()) {
          return Parser.done(uri.absolute(schemeParser && schemeParser.bind(),
                                          authorityParser && authorityParser.bind(),
                                          pathParser && pathParser.bind(),
                                          queryParser.bind()));
        }
      } else if (queryParser.isError()) {
        return queryParser.asError();
      }
    }
    if (step === 8) {
      if (!fragmentParser) {
        fragmentParser = uri.parseFragment(input);
      } else {
        fragmentParser = fragmentParser.feed(input);
      }
      if (fragmentParser.isDone()) {
        return Parser.done(uri.absolute(schemeParser && schemeParser.bind(),
                                        authorityParser && authorityParser.bind(),
                                        pathParser && pathParser.bind(),
                                        queryParser && queryParser.bind(),
                                        fragmentParser.bind()));
      } else if (fragmentParser.isError()) {
        return fragmentParser.asError();
      }
    }
    return new UriAbsoluteParser(uri, schemeParser, authorityParser, pathParser,
                                 queryParser, fragmentParser, step);
  }
}
UriParser.AbsoluteParser = UriAbsoluteParser;
