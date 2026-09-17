#!/usr/bin/env python
# -*-coding:utf-8-*-

'''
/**
 * @file levels.py
 * @author Oliver Merkel <Merkel(dot)Oliver(at)web(dot)de>
 * @date 2019 June 23
 *
 * @section LICENSE
 *
 * Copyright 2019-2026, Oliver Merkel <Merkel(dot)Oliver(at)web(dot)de>
 * Please see the AUTHORS file for details.
 * All rights reserved.
 *
 * Released under the MIT license.
 * Use of this code is governed by a
 * MIT license that can be found in the LICENSE file.
 *
 * @section DESCRIPTION
 *
 * @brief Some Sokoban challenges.
 *
 * Sokoban game is a solitaire puzzle game. The challenges and used
 * symbols for the representation are defined in here.
 *
 * Microban and Sasquatch level sets are maintained by David W. Skinner,
 * sasquatch@bentonrea.com, They used to be published on
 * http://users.bentonrea.com/~sasquatch/sokoban/
 * under a free license and are still available from
 * http://www.abelmartin.com/rj/sokobanJS/Skinner/David%20W.%20Skinner%20-
 * %20Sokoban.htm
 *
 */
'''

import json
from pathlib import Path
from typing import Any, Dict

_LEVELS_JSON = Path(__file__).with_name('levels.json')

with _LEVELS_JSON.open(encoding='utf-8') as _levels_file:
    levels: Dict[str, Any] = json.load(_levels_file)
