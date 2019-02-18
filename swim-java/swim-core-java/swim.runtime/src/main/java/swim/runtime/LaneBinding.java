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

package swim.runtime;

import swim.api.agent.AgentContext;
import swim.api.data.DataFactory;
import swim.api.lane.Lane;
import swim.collections.FingerTrieSeq;
import swim.concurrent.Schedule;
import swim.concurrent.Stage;
import swim.structure.Value;
import swim.uri.Uri;
import swim.util.Log;
import swim.warp.CommandMessage;

public interface LaneBinding extends TierBinding, CellBinding, Log {
  LaneContext laneContext();

  void setLaneContext(LaneContext laneContext);

  <T> T unwrapLane(Class<T> laneClass);

  Uri meshUri();

  Value partKey();

  Uri hostUri();

  Uri nodeUri();

  Uri laneUri();

  Value agentKey();

  Schedule schedule();

  Stage stage();

  DataFactory data();

  Lane getLaneView(AgentContext agentContext);

  void openLaneView(Lane lane);

  void closeLaneView(Lane lane);

  FingerTrieSeq<LinkContext> getUplinks();

  LinkBinding getUplink(Value linkKey);

  void closeUplink(Value linkKey);

  void pushUpCommand(CommandMessage message);
}