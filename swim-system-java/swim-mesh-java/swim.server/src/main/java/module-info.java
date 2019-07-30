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

/**
 * Swim server loader.
 */
module swim.server {
  requires transitive swim.kernel;
  requires transitive swim.store.mem;
  requires transitive swim.remote;
  requires transitive swim.service;
  requires transitive swim.service.web;
  requires transitive swim.auth;
  requires transitive swim.fabric;
  requires transitive swim.java;

  exports swim.server;
}