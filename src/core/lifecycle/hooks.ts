export interface SimpleChanges {
  [propName: string]: {
    previousValue: any;
    currentValue: any;
    firstChange: boolean;
  };
}

export interface OnInit {
  ngOnInit(): void;
}

export interface OnChanges {
  ngOnChanges(changes: SimpleChanges): void;
}

export interface OnDestroy {
  ngOnDestroy(): void;
}

export interface AfterViewInit {
  ngAfterViewInit(): void;
}
