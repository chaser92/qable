const GRAMMAR: string = `Arithmetic {
  Input = 
    Query |
    PropertyGet

  PropertyGet =
    IdKey

  Query = 
    Slice Command |
    FilterQueryList Command |
    MapperQuery Command
    
 FilterQueryList = FilterQueryNext | FilterQuery
 FilterQueryNext = FilterQuery "," FilterQueryList
 
  ident = identStart identPart*
  identStart = letter | "_"
  identPart = identStart | digit

  MapperQuery = MapperNoLiteral

  Mapper = 
    MapperNoLiteral | Literal
    
  MapperNoLiteral = 
      MPick |
      MIdentity |
      MIndex 
  
  MIdentity = "."
  MPick = "." Key
  MIndex = "#"

  Key = IdKey | NumericKey | WrappedKey
  IdKey = ident
  NumericKey = digit+
  WrappedKey = "[" Literal "]"
  Variable = "@"
  
  Literal = LNumber | LBool | LString | LNull | LUndefined | Variable 
  LBool = "true" | "false"
  LNumber = digit+
  LString = "\\"" letter+ "\\""
  LVariable = "@"
  LNull = "null"
  LUndefined = "undefined"
  Transform = NegateTransform
  NegateTransform = "!"
  
  Command = ToArrayCommand | ToStringCommand | NoCommand
  ToArrayCommand = "!"
  ToStringCommand = "$"
  NoCommand = ""
  
  FilterQuery = UnaryFilterQuery | BinaryFilterQuery
                        
  UnaryFilterQuery = Mapper UnaryFilter
  BinaryFilterQuery = Mapper BinaryFilter Mapper
 
  
  UnaryFilter =  FBool | FOdd | FEven
  BinaryFilter = FLessEqual | FGreaterEqual | FLess | FGreater | FEqual | FMatches
  
  FBool = "?"
  FOdd = "odd"
  FEven = "even"
  
  FLessEqual = "<="
  FGreaterEqual = ">="
  FLess = "<"
  FGreater = ">"
  FEqual = "===" | "="
  FMatches = "%"

  LNumberOrNull = LNumber | ""
  
  Slice = StepSlice | NoStepSlice
  StepSlice = LNumberOrNull ":" LNumberOrNull ":" LNumberOrNull
  NoStepSlice = LNumberOrNull ":" LNumberOrNull

  }
  `;

  export default GRAMMAR;