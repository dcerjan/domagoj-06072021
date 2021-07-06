import { Subject } from 'rxjs'

import { KnownProduct } from '../../domain/KnownProduct'

export const subscribeToOrderBookFeedIntent$ = new Subject<KnownProduct>()
export const unsubscribeToOrderBookFeedIntent$ = new Subject<KnownProduct>()
export const closeFeedIntent$ = new Subject<void>()
export const openFeedIntent$ = new Subject<void>()
